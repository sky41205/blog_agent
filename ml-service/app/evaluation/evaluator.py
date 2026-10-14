import numpy as np
from sklearn.metrics import (
    accuracy_score, precision_score, recall_score, f1_score,
    mean_absolute_error, mean_squared_error, r2_score
)
from typing import Dict, Any

def evaluate_classification(y_true, y_pred) -> Dict[str, float]:
    """Calculates Accuracy, Precision, Recall, and F1 Score."""
    return {
        "accuracy": round(float(accuracy_score(y_true, y_pred)), 4),
        "precision": round(float(precision_score(y_true, y_pred, average="weighted", zero_division=0)), 4),
        "recall": round(float(recall_score(y_true, y_pred, average="weighted", zero_division=0)), 4),
        "f1": round(float(f1_score(y_true, y_pred, average="weighted", zero_division=0)), 4)
    }

def evaluate_regression(y_true, y_pred) -> Dict[str, float]:
    """Calculates MAE, RMSE, and R-squared."""
    mae = float(mean_absolute_error(y_true, y_pred))
    mse = float(mean_squared_error(y_true, y_pred))
    rmse = float(np.sqrt(mse))
    r2 = float(r2_score(y_true, y_pred))
    
    return {
        "mae": round(mae, 4),
        "rmse": round(rmse, 4),
        "r2": round(max(-1.0, r2), 4)
    }
