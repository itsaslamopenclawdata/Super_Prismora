/**
 * MobileNet classifier model
 */
import * as tf from '@tensorflow/tfjs';
import { ModelMetadata, PredictionResult, Prediction, InferenceOptions } from '../types';

export class MobileNetClassifier {
  private model: tf.GraphModel | null = null;
  private metadata: ModelMetadata;

  private static readonly DEFAULT_CLASSES = [
    'background', 'tench', 'goldfish', 'great_white_shark', 'tiger_shark',
    'hammerhead', 'electric_ray', 'stingray', 'cock', 'hen', 'ostrich', 'brambling',
    'goldfinch', 'house_finch', 'junco', 'indigo_bunting', 'robin', 'bulbul',
    'jay', 'magpie', 'chickadee', 'water_ouzel', 'kite', 'bald_eagle', 'vulture',
    'great_grey_owl', 'European_fire_salamander', 'common_newt', 'eft', 'spotted_salamander',
    'axolotl', 'bullfrog', 'tree_frog', 'tailed_frog', 'loggerhead', 'leatherback_turtle',
    'mud_turtle', 'terrapin', 'box_turtle', 'banded_gecko', 'common_iguana',
    'American_chameleon', 'whiptail', 'agama', 'frilled_lizard', 'alligator_lizard',
    'Gila_monster', 'green_lizard', 'African_chameleon', 'Komodo_dragon',
    'African_crocodile', 'American_alligator', 'triceratops', 'thunder_snake',
    'ringneck_snake', 'hognose_snake', 'green_snake', 'king_snake', 'garter_snake',
    'water_snake', 'vine_snake', 'night_snake', 'boa_constrictor', 'rock_python',
    'Indian_cobra', 'green_mamba', 'sea_snake', 'horned_viper', 'diamondback',
    'sidewinder', 'trilobite', 'harvestman', 'scorpion', 'black_and_gold_garden_spider',
    'barn_spider', 'garden_spider', 'black_widow', 'tarantula', 'wolf_spider', 'tick'
  ];

  constructor(metadata?: Partial<ModelMetadata>) {
    this.metadata = {
      name: 'MobileNetV2',
      version: '1.0.0',
      inputShape: [1, 224, 224, 3],
      outputShape: [1, 1001],
      classes: MobileNetClassifier.DEFAULT_CLASSES,
      type: 'classification',
      ...metadata
    };
  }

  /**
   * Load model from path
   */
  static async load(modelPath: string): Promise<MobileNetClassifier> {
    const classifier = new MobileNetClassifier();
    classifier.model = await tf.loadGraphModel(modelPath);
    console.log('MobileNet model loaded');
    return classifier;
  }

  /**
   * Preprocess image
   */
  preprocess(image: tf.Tensor3D): tf.Tensor4D {
    // Resize to 224x224
    let resized = tf.image.resizeBilinear(image, [224, 224]);

    // Normalize to [0, 1]
    resized = resized.div(255.0);

    // Add batch dimension
    return resized.expandDims(0);
  }

  /**
   * Run inference on image
   */
  async predict(
    image: tf.Tensor4D,
    options: InferenceOptions = {}
  ): Promise<PredictionResult> {
    if (!this.model) {
      throw new Error('Model not loaded');
    }

    const startTime = performance.now();

    // Run inference
    const output = this.model.execute(image) as tf.Tensor;
    const predictions = output.squeeze() as tf.Tensor1D;

    // Get top K predictions
    const topK = options.topK || 5;
    const threshold = options.threshold || 0.0;

    const topKIndices = await predictions.topk(topK).indices.data();
    const topKValues = await predictions.topk(topK).values.data();

    // Build prediction results
    const results: Prediction[] = [];
    for (let i = 0; i < topK; i++) {
      const index = topKIndices[i];
      const probability = topKValues[i];

      if (probability < threshold) {
        continue;
      }

      results.push({
        className: this.metadata.classes[index] || `class_${index}`,
        probability: probability,
        label: this.metadata.classes[index]
      });
    }

    // Clean up
    output.dispose();
    predictions.dispose();

    const endTime = performance.now();

    return {
      predictions: results,
      processingTime: endTime - startTime,
      modelUsed: this.metadata.name
    };
  }

  /**
   * Get model metadata
   */
  getMetadata(): ModelMetadata {
    return this.metadata;
  }

  /**
   * Dispose model
   */
  dispose(): void {
    if (this.model) {
      this.model.dispose();
      this.model = null;
    }
  }
}
