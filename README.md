# LaTeX Generator Plugin for Obsidian

## Description

The LaTeX Generator is a powerful plugin for Obsidian that allows you to easily convert natural language expressions into LaTeX equations. This plugin leverages the power of Ollama, a local LLM serving platform, or any OpenAI API compatible model to provide accurate and quick conversions right within your Obsidian editor.

## Features

- Convert selected text to LaTeX equations with a single command
- Customizable Ollama model selection
- Customizable OpenAI model endpoint
- Visual feedback with a loading indicator during conversion
- Detailed error messages for troubleshooting

## Requirements

1. Obsidian v0.9.7 or higher
2. One of the following
   - Ollama installed and running locally (see [Ollama's official website](https://ollama.com/) for installation instructions)
   - An API key, model endpoint and model name for an OpenAI compatible model (For example, [Groq](https://groq.com/) is a fast and free option)

## Installation

1. Open Obsidian and go to Settings
2. Navigate to Community Plugins and disable Safe Mode
3. Click on Browse and search for "LaTeX Generator"
4. Install the plugin and enable it

Alternatively, you can manually install the plugin:

1. Download the latest release from the GitHub repository
2. Extract the zip file in your Obsidian vault's `.obsidian/plugins/` directory
3. Reload Obsidian
4. Go to Settings > Community Plugins and enable "LaTeX Generator"

## Usage

1. Select the text you want to convert to a LaTeX equation
2. Use the command palette (Ctrl/Cmd + P) and search for "Convert to LaTeX"
3. Click on the command or use the assigned hotkey
4. The plugin will convert your selected text to a LaTeX equation

## Configuration

To configure the LaTeX Generator plugin:

1. Go to Settings > Community Plugins
2. Find "LaTeX Generator" in the list and click on the gear icon
3. In the settings tab, you can:
   - Choose between using a local model (Ollama) or an OpenAI compatible model
   - Set the name of the Ollama/OpenAI model to use for conversions (default is "llama2")
   - Set the API Key (OpenAI only)
   - Set the model endpoint (OpenAI only)

## Troubleshooting

If you encounter any issues:

1. Ensure Ollama is installed and running on your local machine
2. Check that the Ollama service is accessible at `http://localhost:11434`
3. Verify that the model specified in the plugin settings is available in your Ollama installation
4. If you see error messages, they will provide details about what went wrong. Common issues include:
   - Connection problems with Ollama
   - Invalid responses from the model
   - Parsing errors

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

This plugin is licensed under the MIT License. See the LICENSE file for details.

## Support

If you're having trouble with the plugin, please open an issue on the GitHub repository.

## Changelog

### 1.0.0

- Initial release
- Basic conversion functionality
- Customizable model selection
- Loading indicator
- Detailed error messages

---

I hope you find the LaTeX Generator plugin useful for your mathematical and scientific writing in Obsidian. Happy note-taking!
