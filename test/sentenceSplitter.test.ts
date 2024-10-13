import Benchmarker from '../src/benchmarker';

const benchmarker = new Benchmarker();

test('Sanity Check - see benchmarker for details and enable env.debug for more info', async () => {
  const accuracy = await benchmarker.benchmark();
  expect(accuracy).toEqual(100);
});
