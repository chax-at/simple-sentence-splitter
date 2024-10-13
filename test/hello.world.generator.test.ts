import { HelloWorldGenerator } from '../src/hello.world.generator';

const helloWorldGenerator = new HelloWorldGenerator();

test('Hello world generator default value', () => {
  const returnedString = helloWorldGenerator.getGreetingString();
  expect(returnedString).toEqual('Hello World');
});

test('Hello world generator specific name', () => {
  const returnedString = helloWorldGenerator.getGreetingString('Mattis');
  expect(returnedString).toEqual('Hello Mattis');
});
