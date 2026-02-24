from fastapi import APIRouter, HTTPException, Query
from pydantic import BaseModel
import pandas as pd
import yfinance as yf
import warnings
warnings.simplefilter(action='ignore', category=FutureWarning)

router = APIRouter(prefix="/predict", tags=["predict"])


class PredictResponse(BaseModel):
    ticker: str
    company_name: str
    currency: str
    historic: list
    forecast: list
    metrics: dict
    current_price: float
    price_change_pct: float


@router.get("/search")
async def search_ticker(q: str = Query(..., min_length=1)):
    # Search for ticker info
    try:
        ticker = yf.Ticker(q.upper())
        info = ticker.info
        if not info or "regularMarketPrice" not in info and "currentPrice" not in info:
            raise HTTPException(status_code=404, detail="Ticker not found")
        return {
            "ticker": q.upper(),
            "name": info.get("longName") or info.get("shortName") or q.upper(),
            "currency": info.get("currency", "USD"),
            "sector": info.get("sector", ""),
            "current_price": info.get("currentPrice") or info.get("regularMarketPrice") or 0,
        }
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.get("/forecast")
async def get_forecast(
    ticker: str = Query(...),
    start: str = Query(default="2022-01-01"),
    periods: int = Query(default=180, ge=30, le=365)
):
    # Download historical data and run NeuralProphet forecast
    try:
        from neuralprophet import NeuralProphet
        import torch
        import torch.serialization
        from sklearn.metrics import r2_score, mean_absolute_error, mean_absolute_percentage_error

        # Patch torch load for NeuralProphet compatibility
        _original_load = torch.load
        torch.load = lambda *a, **kw: _original_load(*a, **{**kw, "weights_only": False})

        ticker_upper = ticker.upper()
        end = pd.Timestamp.today().strftime("%Y-%m-%d")

        # Download data
        data = yf.download(ticker_upper, start=start, end=end, multi_level_index=False)
        if data.empty:
            raise HTTPException(status_code=404, detail=f"No data found for ticker '{ticker_upper}'")

        data = data[["Close"]].reset_index()
        data.columns = ["ds", "y"]
        data["ds"] = pd.to_datetime(data["ds"]).dt.tz_localize(None)
        data = data.dropna()

        if len(data) < 30:
            raise HTTPException(status_code=400, detail="Not enough historical data (minimum 30 days required)")

        # Train model
        model = NeuralProphet(
            n_forecasts=1,
            n_lags=0,
            yearly_seasonality=True,
            weekly_seasonality=True,
            daily_seasonality=False,
        )
        model.fit(data, freq="B", progress="none")

        # Future forecast
        future_data = model.make_future_dataframe(data, periods=periods)
        forecast_df = model.predict(future_data)

        # Historic fitted values
        historic_df = model.predict(data)

        # Restore torch
        torch.load = _original_load

        # Metrics
        valid = historic_df.dropna(subset=["y", "yhat1"])
        r2   = round(float(r2_score(valid["y"], valid["yhat1"])), 4)
        mae  = round(float(mean_absolute_error(valid["y"], valid["yhat1"])), 4)
        mape = round(float(mean_absolute_percentage_error(valid["y"], valid["yhat1"])) * 100, 2)

        # Current price & change
        current_price = float(data["y"].iloc[-1])
        last_forecast  = float(forecast_df["yhat1"].iloc[-1])
        price_change_pct = round(((last_forecast - current_price) / current_price) * 100, 2)

        # Serialize
        historic_out = [
            {"date": str(row.ds.date()), "actual": round(float(row.y), 4), "predicted": round(float(row.yhat1), 4)}
            for row in valid.itertuples() if pd.notna(row.yhat1)
        ]
        forecast_out = [
            {"date": str(row.ds.date()), "predicted": round(float(row.yhat1), 4)}
            for row in forecast_df.itertuples()
            if pd.notna(row.yhat1) and pd.Timestamp(row.ds) > pd.Timestamp(data["ds"].iloc[-1])
        ]

        # Ticker info
        ticker_obj = yf.Ticker(ticker_upper)
        info = ticker_obj.info
        company_name = info.get("longName") or info.get("shortName") or ticker_upper
        currency = info.get("currency", "USD")

        return PredictResponse(
            ticker=ticker_upper,
            company_name=company_name,
            currency=currency,
            historic=historic_out,
            forecast=forecast_out,
            metrics={"r2": r2, "mae": mae, "mape": mape},
            current_price=current_price,
            price_change_pct=price_change_pct,
        )

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Prediction error: {str(e)}")