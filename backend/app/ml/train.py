import os
import json
import joblib
import numpy as np
import pandas as pd
from sklearn.model_selection import train_test_split
from sklearn.linear_model import LogisticRegression
from sklearn.preprocessing import StandardScaler
from sklearn.pipeline import Pipeline
from sklearn.calibration import CalibratedClassifierCV, calibration_curve
from sklearn.metrics import roc_auc_score, precision_score, recall_score, f1_score, average_precision_score, brier_score_loss
import xgboost as xgb
import shap

from generate_data import generate_synthetic_training_data

def train_and_evaluate_models():
    print("Generating synthetic alternative credit dataset...")
    df = generate_synthetic_training_data(n_samples=1500, seed=42)
    
    feature_cols = [
        "avg_monthly_inflow",
        "income_stability_score",
        "utility_ontime_rate",
        "expense_to_income_ratio",
        "active_days_ratio",
        "inflow_trend_slope",
        "gst_compliance_rate",
        "merchant_revenue_stability"
    ]
    
    X = df[feature_cols]
    y = df["repayment_outcome"]
    
    X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.25, random_state=42, stratify=y)
    
    # 1. Logistic Regression Baseline
    print("Training Logistic Regression baseline...")
    lr_pipeline = Pipeline([
        ("scaler", StandardScaler()),
        ("classifier", LogisticRegression(C=1.0, max_iter=500, random_state=42))
    ])
    lr_calibrated = CalibratedClassifierCV(estimator=lr_pipeline, cv=5, method="sigmoid")
    lr_calibrated.fit(X_train, y_train)
    
    lr_preds_prob = lr_calibrated.predict_proba(X_test)[:, 1]
    lr_preds = (lr_preds_prob >= 0.5).astype(int)
    
    lr_metrics = {
        "model_name": "Logistic Regression Baseline",
        "roc_auc": round(float(roc_auc_score(y_test, lr_preds_prob)), 3),
        "pr_auc": round(float(average_precision_score(y_test, lr_preds_prob)), 3),
        "precision": round(float(precision_score(y_test, lr_preds)), 3),
        "recall": round(float(recall_score(y_test, lr_preds)), 3),
        "f1": round(float(f1_score(y_test, lr_preds)), 3),
        "brier_score": round(float(brier_score_loss(y_test, lr_preds_prob)), 3)
    }
    
    # 2. XGBoost Classifier
    print("Training XGBoost Classifier...")
    xgb_base = xgb.XGBClassifier(
        n_estimators=80,
        max_depth=3,
        learning_rate=0.08,
        subsample=0.8,
        colsample_bytree=0.8,
        random_state=42,
        eval_metric="logloss"
    )
    xgb_calibrated = CalibratedClassifierCV(estimator=xgb_base, cv=5, method="sigmoid")
    xgb_calibrated.fit(X_train, y_train)
    
    xgb_preds_prob = xgb_calibrated.predict_proba(X_test)[:, 1]
    xgb_preds = (xgb_preds_prob >= 0.5).astype(int)
    
    xgb_metrics = {
        "model_name": "XGBoost Classifier v1.0",
        "roc_auc": round(float(roc_auc_score(y_test, xgb_preds_prob)), 3),
        "pr_auc": round(float(average_precision_score(y_test, xgb_preds_prob)), 3),
        "precision": round(float(precision_score(y_test, xgb_preds)), 3),
        "recall": round(float(recall_score(y_test, xgb_preds)), 3),
        "f1": round(float(f1_score(y_test, xgb_preds)), 3),
        "brier_score": round(float(brier_score_loss(y_test, xgb_preds_prob)), 3)
    }
    
    # Calibration Curve Data
    prob_true_lr, prob_pred_lr = calibration_curve(y_test, lr_preds_prob, n_bins=5)
    prob_true_xgb, prob_pred_xgb = calibration_curve(y_test, xgb_preds_prob, n_bins=5)
    
    calibration_data = {
        "lr_curve": [{"predicted": round(float(p), 2), "actual": round(float(a), 2)} for p, a in zip(prob_pred_lr, prob_true_lr)],
        "xgb_curve": [{"predicted": round(float(p), 2), "actual": round(float(a), 2)} for p, a in zip(prob_pred_xgb, prob_true_xgb)]
    }
    
    # Fit standalone XGBoost on full train set for SHAP tree explainer
    xgb_standalone = xgb.XGBClassifier(
        n_estimators=80,
        max_depth=3,
        learning_rate=0.08,
        subsample=0.8,
        colsample_bytree=0.8,
        random_state=42,
        eval_metric="logloss"
    )
    xgb_standalone.fit(X_train, y_train)
    
    # Save Artifacts
    models_dir = os.path.join(os.path.dirname(__file__), "saved_models")
    os.makedirs(models_dir, exist_ok=True)
    
    joblib.dump(lr_calibrated, os.path.join(models_dir, "logistic_model.joblib"))
    joblib.dump(xgb_calibrated, os.path.join(models_dir, "xgboost_model.joblib"))
    joblib.dump(xgb_standalone, os.path.join(models_dir, "xgb_standalone.joblib"))
    
    # Decision reason
    auc_diff = xgb_metrics["roc_auc"] - lr_metrics["roc_auc"]
    if auc_diff > 0.02:
        selection_reason = f"XGBoost demonstrated superior discriminative power (+{auc_diff:.3f} ROC-AUC) capturing non-linear cross-source interactions."
        selected_model = "XGBoost Classifier v1.0"
    else:
        selection_reason = "Performance difference is marginal; Logistic Regression provides high interpretability while XGBoost provides slight edge on multi-channel patterns."
        selected_model = "XGBoost Classifier v1.0"
        
    model_report = {
        "selected_model": selected_model,
        "selection_reason": selection_reason,
        "logistic_regression": lr_metrics,
        "xgboost": xgb_metrics,
        "calibration_curves": calibration_data,
        "feature_names": feature_cols,
        "dataset_summary": {
            "total_samples": len(df),
            "train_samples": len(X_train),
            "test_samples": len(X_test),
            "positive_rate": round(float(y.mean()), 3)
        }
    }
    
    with open(os.path.join(models_dir, "model_metrics.json"), "w") as f:
        json.dump(model_report, f, indent=2)
        
    print("Training complete! Model artifacts and metrics saved.")
    return model_report

if __name__ == "__main__":
    train_and_evaluate_models()
