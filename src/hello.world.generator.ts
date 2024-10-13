export class HelloWorldGenerator {
  /**
   * Get a greeting string for the given name.
   *
   * @param name - Name of the person to greet. Defaults to greeting the whole world if not specified.
   */
  public getGreetingString(name = 'World'): string {
    return `Hello ${name}`;
  }
}
