# AI Model Testing Guide

This document provides comprehensive guidance for testing AI/ML models in the PhotoIdentifier platform.

## Overview

AI model testing ensures that:
- Model accuracy meets minimum thresholds
- Performance requirements are satisfied
- Edge cases are handled gracefully
- Model behavior is consistent across versions

## Test Types

### 1. Accuracy Tests

Evaluate how well the model identifies objects correctly.

**Metrics:**
- Overall accuracy: % of correct predictions
- Per-class accuracy: accuracy for each label/category
- Precision/Recall: for multi-class classification
- F1 Score: harmonic mean of precision and recall

**Running Accuracy Tests:**

```bash
# Run all accuracy tests
pytest tests/integration/test_ai_model.py::test_model_accuracy_on_test_dataset -v

# Run per-class accuracy
pytest tests/integration/test_ai_model.py -m accuracy -v
```

**Thresholds:**
- Overall accuracy: ≥90%
- Per-class accuracy: ≥85%

### 2. Confidence Calibration Tests

Verify that model confidence scores are meaningful and reliable.

**Metrics:**
- Confidence vs accuracy correlation
- Bucket accuracy (high/medium/low confidence)
- Calibration error

**Running Calibration Tests:**

```bash
pytest tests/integration/test_ai_model.py::test_confidence_calibration -v
```

**Requirements:**
- High confidence (≥0.8) predictions should be more accurate
- Medium confidence (0.5-0.8) should be moderately accurate
- Low confidence (<0.5) should be least accurate

### 3. Performance Tests

Ensure model inference speed meets SLA requirements.

**Metrics:**
- Average inference time
- Max inference time
- Memory usage
- Throughput (images/second)

**Running Performance Tests:**

```bash
# Run all performance tests
pytest tests/integration/test_ai_model.py -m performance -v

# Run specific performance test
pytest tests/integration/test_ai_model.py::test_model_inference_time -v
```

**Thresholds:**
- Single image: <2 seconds
- Average: <1.5 seconds
- Memory: <500 MB

### 4. Robustness Tests

Test model behavior on edge cases and challenging inputs.

**Test Categories:**
- Low resolution images
- Unusual lighting conditions
- Partial occlusion
- Image corruption
- Unsupported formats

**Running Robustness Tests:**

```bash
pytest tests/integration/test_ai_model.py::test_low_resolution_images -v
pytest tests/integration/test_ai_model.py::test_unusual_lighting_conditions -v
pytest tests/integration/test_ai_model.py::test_partial_occlusion -v
```

**Requirements:**
- Success rate: ≥80% on edge cases
- No crashes or unhandled exceptions
- Graceful degradation (lower confidence, not no predictions)

## Model Evaluation Script

Comprehensive evaluation script that generates detailed reports.

### Running Evaluation

```bash
# Run full evaluation
python scripts/evaluate_model.py

# This generates:
# - model-evaluation-report.json: Detailed metrics
# - Console output with summary
```

### Report Structure

```json
{
  "timestamp": "2024-02-22T10:00:00",
  "model_version": "v1.0.0",
  "tests": {
    "accuracy": {
      "overall_accuracy": 0.92,
      "per_class_accuracy": {
        "cat": 0.95,
        "dog": 0.89,
        ...
      },
      "passes": true
    },
    "confidence_calibration": {
      "is_well_calibrated": true,
      "passes": true
    },
    "performance": {
      "avg_inference_time_ms": 1250,
      "slow_predictions": 3,
      "passes": true
    },
    "robustness": {
      "min_success_rate": 0.85,
      "passes": true
    }
  },
  "overall_pass": true,
  "summary": {
    "total_tests": 4,
    "passed_tests": 4,
    "failed_tests": 0
  }
}
```

## Test Dataset

### Structure

```
data/
├── test/
│   ├── cat_001.jpg
│   ├── cat_002.jpg
│   ├── dog_001.jpg
│   └── ...
├── labels.json          # Ground truth labels
└── edge_cases/
    ├── low_res/
    ├── dark/
    ├── bright/
    └── occluded/
```

### Labels Format

```json
{
  "cat_001.jpg": "cat",
  "dog_001.jpg": "dog",
  "multi_obj_001.jpg": ["cat", "dog"]
}
```

## Writing New AI Tests

### Accuracy Test Template

```python
@pytest.mark.ai
def test_model_accuracy_on_new_dataset():
    """Test accuracy on a new category of images."""
    from app.ai.model import PhotoIdentifierModel
    
    model = PhotoIdentifierModel()
    test_images = load_test_dataset(category='new_category')
    
    correct = sum(
        1 for img in test_images
        if get_dominant(model.identify(img)) == img['ground_truth']
    )
    
    accuracy = correct / len(test_images)
    assert accuracy >= 0.90, f"Accuracy {accuracy:.2%} below 90%"
```

### Performance Test Template

```python
@pytest.mark.ai
@pytest.mark.performance
def test_model_performance_on_new_use_case():
    """Test performance for a new use case."""
    from app.ai.model import PhotoIdentifierModel
    
    model = PhotoIdentifierModel()
    images = load_test_images(use_case='new_use_case', count=100)
    
    start = time.time()
    for img in images:
        model.identify(img)
    elapsed = time.time() - start
    
    avg_time = elapsed / len(images)
    assert avg_time < 2.0, f"Avg time {avg_time:.2f}s exceeds 2s"
```

### Robustness Test Template

```python
@pytest.mark.ai
def test_model_robustness_to_new_edge_case():
    """Test model handles a new edge case."""
    from app.ai.model import PhotoIdentifierModel
    
    model = PhotoIdentifierModel()
    edge_case_images = load_edge_case_images('new_case')
    
    successful = 0
    for img in edge_case_images:
        try:
            predictions = model.identify(img)
            if len(predictions) > 0:
                successful += 1
        except Exception:
            pass
    
    success_rate = successful / len(edge_case_images)
    assert success_rate >= 0.80, f"Success rate {success_rate:.2%} below 80%"
```

## Continuous Integration

### CI Pipeline Integration

```yaml
# .github/workflows/ai-model-tests.yml
name: AI Model Tests

on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-python@v4
        with:
          python-version: '3.11'
      
      - name: Install dependencies
        run: |
          pip install -r requirements-test.txt
          pip install -r requirements-ai.txt
      
      - name: Run accuracy tests
        run: pytest tests/integration/test_ai_model.py -m accuracy -v
      
      - name: Run performance tests
        run: pytest tests/integration/test_ai_model.py -m performance -v
      
      - name: Run robustness tests
        run: pytest tests/integration/test_ai_model.py -m robustness -v
      
      - name: Generate evaluation report
        run: python scripts/evaluate_model.py
      
      - name: Upload report
        uses: actions/upload-artifact@v3
        with:
          name: model-evaluation-report
          path: model-evaluation-report.json
```

## Model Version Testing

### Version Comparison

When deploying a new model version, compare against previous:

```bash
# Test current version
pytest tests/integration/test_ai_model.py -v --junitxml=results-v1.xml

# Deploy new version
# ...

# Test new version
pytest tests/integration/test_ai_model.py -v --junitxml=results-v2.xml

# Compare results
python scripts/compare_model_versions.py results-v1.xml results-v2.xml
```

### Regression Testing

Detect if new model performs worse on existing cases:

```bash
# Run regression suite
pytest tests/integration/test_ai_model.py::test_model_regression -v
```

## Troubleshooting

### Low Accuracy

**Symptoms:** Accuracy below 90% threshold

**Possible Causes:**
- Model not properly trained on test data
- Data distribution shift
- Label mismatch
- Image preprocessing issues

**Solutions:**
1. Verify test dataset labels
2. Check model training data
3. Review image preprocessing pipeline
4. Consider model retraining

### Slow Performance

**Symptoms:** Inference time exceeds 2 seconds

**Possible Causes:**
- Model too large
- Inefficient implementation
- Hardware limitations
- Batch size too large/small

**Solutions:**
1. Profile inference code
2. Consider model quantization
3. Optimize batch size
4. Use hardware acceleration (GPU)

### Poor Robustness

**Symptoms:** Low success rate on edge cases

**Possible Causes:**
- Training data lacks variety
- Model overfitting
- Preprocessing issues

**Solutions:**
1. Augment training data
2. Add regularization
3. Improve preprocessing
4. Add data normalization

## Best Practices

1. **Use Labeled Test Data:** Always test against ground truth labels
2. **Monitor Over Time:** Track accuracy/performance trends
3. **Automate Testing:** Run tests in CI/CD pipeline
4. **Document Results:** Keep historical evaluation reports
5. **Version Control:** Track model versions and test results
6. **Realistic Data:** Use production-like test data
7. **Comprehensive Coverage:** Test various scenarios and edge cases
8. **Performance Budgets:** Set and enforce performance thresholds

## Resources

- [ML Testing Best Practices](https://scikit-learn.org/stable/model_evaluation.html)
- [Model Evaluation Metrics](https://mlflow.org/docs/latest/model-evaluation.html)
- [Pytest Documentation](https://docs.pytest.org/)
- [CI/CD for ML Models](https://www.tensorflow.org/tfx/guide/cicd)
