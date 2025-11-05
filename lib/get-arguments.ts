const argument_keys = ['input', 'output'] as const; 
type ArgumentKey = typeof argument_keys[number];
type ArgumentsMap = Record<ArgumentKey, string>;

const available_arguments: Record<string, ArgumentKey> = {
  '--input': 'input',
  '-i': 'input',
  '--output': 'output',
  '-o': 'output',
};

export const getArguments = (args: string[]): ArgumentsMap => {
  const relevant_arguments: Record<string, string> = args
    .filter(argument => argument.includes("="))
    .map(argument => argument.split("="))
    .map(([key, value]) => [available_arguments[key], value])
    .reduce((acc, [key, val]) => ({ ...acc, [key]: val }), {});

  const missing_arguments = argument_keys.filter(key => typeof relevant_arguments[key] === "undefined")

  if (missing_arguments.length) {
    throw Error(`Missing arguments: ${missing_arguments.join(", ")}`)
  }

  return relevant_arguments as ArgumentsMap;
}

