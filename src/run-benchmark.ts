// Run the benchmark
import Benchmarker from './benchmarker';

const benchmarker = new Benchmarker();

benchmarker.benchmark().catch(console.error);
