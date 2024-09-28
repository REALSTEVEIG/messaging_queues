
const exampleService = async (): Promise<string> => {
    return 'This is example data from the service layer.';
}

const greetingService = async (name: string): Promise<string> => {
    return `Hello ${name}...`;
}

export { exampleService, greetingService };
