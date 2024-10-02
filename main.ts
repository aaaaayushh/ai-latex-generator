import { App, Plugin, PluginSettingTab, Setting, Notice, Editor } from 'obsidian';

interface LatexConverterSettings {
    model: string;
    llmType: string;
    apiKey: string;
    apiEndpoint: string;
}

const DEFAULT_SETTINGS: LatexConverterSettings = {
    model: 'llama2',
    llmType: 'ollama',
    apiKey: '',
    apiEndpoint: '',
}

export default class LatexConverterPlugin extends Plugin {
    settings: LatexConverterSettings;

    async onload() {
        await this.loadSettings();

        this.addCommand({
            id: 'convert-to-latex',
            name: 'Convert to LaTeX',
            editorCallback: (editor) => this.convertToLatex(editor),
        });

        this.addSettingTab(new LatexConverterSettingTab(this.app, this));
    }

    async loadSettings() {
        this.settings = Object.assign({}, DEFAULT_SETTINGS, await this.loadData());
    }

    async saveSettings() {
        await this.saveData(this.settings);
    }

    async convertToLatex(editor: Editor) {
        const selection = editor.getSelection();
        if (!selection) {
            new Notice('No text selected. Please select the text you want to convert to LaTeX.', 5000);
            return;
        }

        const loadingNotice = new Notice('Converting to LaTeX...', 0);

        try {
            const latexEquation = await this.callLocalLLM(selection);
            editor.replaceSelection(`$${latexEquation}$`);
            new Notice('Successfully converted to LaTeX!', 3000);
        } catch (error) {
            this.handleError(error);
        } finally {
            loadingNotice.hide();
        }
    }
    async callLocalLLM(input: string): Promise<string> {
        const isOllama = this.settings.llmType === 'ollama';
        const endpoint = isOllama
            ? 'http://localhost:11434/api/generate'
            : this.settings.apiEndpoint;
        const headers = isOllama
            ? { 'Content-Type': 'application/json' }
            : {
                'Authorization': 'Bearer ' + this.settings.apiKey,
                'Content-Type': 'application/json',
            };
        const body = isOllama
            ? JSON.stringify({
                  model: this.settings.model,
                  prompt: `Convert the following natural language to a LaTeX equation, output ONLY THE EQUATION AND NOTHING ELSE: "${input}". Output should be in this format: \${output}\$`,
                  stream: true,
              })
            : JSON.stringify({
                  messages: [
                      {
                          role: 'user',
                          content: `Convert the following natural language to a LaTeX equation, output ONLY THE EQUATION AND NOTHING ELSE: "${input}". Output should be in this format: \${output}\$`,
                      },
                  ],
                  model: this.settings.model,
              });
    
        return this.callLLM(endpoint, headers, body, isOllama);
    }
    
    async callLLM(endpoint: string, headers: object, body: string, isOllama: boolean): Promise<string> {
        try {
            const response = await fetch(endpoint, {
                method: 'POST',
                headers,
                body,
            });
    
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
    
            const reader = response.body?.getReader();
            if (!reader) {
                throw new Error('Unable to read response from your model endpoint');
            }
    
            let latexEquation = '';
            while (true) {
                const { done, value } = await reader.read();
                if (done) break;
    
                const chunk = new TextDecoder().decode(value);
                const lines = chunk.split('\n').filter(line => line.trim() !== '');
    
                for (const line of lines) {
                    try {
                        const data = JSON.parse(line);
                        if (isOllama && data.response) {
                            latexEquation += data.response;
                        } else if (!isOllama && data.choices && data.choices[0]?.message?.content) {
                            latexEquation += data.choices[0].message.content;
                        }
                    } catch (parseError) {
                        console.error('Error parsing JSON:', parseError);
                        throw new Error('Failed to parse response from model');
                    }
                }
            }
    
            return latexEquation.trim();
        } catch (error) {
            console.error('Error in callLLM:', error);
            throw error;
        }
    }
    handleError(error: any) {
        let errorMessage = 'An unexpected error occurred while converting to LaTeX.';
        
        if (error instanceof Error) {
            if (error.message.includes('HTTP error')) {
                if (this.settings.llmType === 'ollama') {
                    errorMessage = `Failed to connect to Ollama. Please ensure Ollama is running and accessible at http://localhost:11434. Error: ${error.message}`;
                }
                else {
                    errorMessage = `Failed to connect to your model. Please ensure the API key and endpoint are correct. Error: ${error.message}`;
                }
            } else if (error.message.includes('Failed to parse response')) {
                if (this.settings.llmType === 'ollama') {
                    errorMessage = `Received an invalid response from Ollama. The model might be having issues. Error: ${error.message}`;
                }
                else {
                    errorMessage = `Received an invalid response from your model. The model might be having issues. Error: ${error.message}`;
                }
            } else if (error.message.includes('Unable to read response')) {
                if (this.settings.llmType === 'ollama') {
                    errorMessage = `Failed to read the response from Ollama. The connection might have been interrupted. Error: ${error.message}`;
                }
                else {
                    errorMessage = `Failed to read the response from your model. The connection might have been interrupted. Error: ${error.message}`;
                }
            } else {
                errorMessage = `Error converting to LaTeX: ${error.message}`;
            }
        }
        
        new Notice(errorMessage, 10000);
        console.error(errorMessage);
    }
}

class LatexConverterSettingTab extends PluginSettingTab {
    plugin: LatexConverterPlugin;

    constructor(app: App, plugin: LatexConverterPlugin) {
        super(app, plugin);
        this.plugin = plugin;
    }

    display(): void {
        const {containerEl} = this;

        containerEl.empty();

        containerEl.createEl('h2', {text: 'LaTeX Generator Settings'});
        //This is the settings dropdown to select whether to use ollama or openai
        //The default is ollama
        new Setting(containerEl)
            .setName('API')
            .setDesc('Choose the API to use for LaTeX conversion')
            .addDropdown(dropdown => dropdown
                .addOptions({
                    'ollama': 'Ollama',
                    'openai': 'OpenAI Compatible',
                })
                .setValue(this.plugin.settings.llmType)
                .onChange(async (value) => {
                    this.plugin.settings.llmType = value;
                    await this.plugin.saveSettings();
                }));
        //This is the input to select the model to use for ollama
        new Setting(containerEl)
            .setName('Model Name')
            .setDesc('Choose the Model name for Ollama or OpenAI to use for LaTeX conversion')
            .addText(text => text
                .setPlaceholder('Enter model name')
                .setValue(this.plugin.settings.model)
                .onChange(async (value) => {
                    this.plugin.settings.model = value;
                    await this.plugin.saveSettings();
                }));
        //This is the the text input to enter the api key
        new Setting(containerEl)
            .setName('OpenAI API Key')
            .setDesc('Enter the OpenAI API key')
            .addText(text => text
                .setPlaceholder('Enter API key')
                .setValue(this.plugin.settings.apiKey)
                .onChange(async (value) => {
                    this.plugin.settings.apiKey = value;
                    await this.plugin.saveSettings();
                }));
        //This is the the text input to enter the api endpoint
        new Setting(containerEl)
            .setName('OpenAI API Endpoint')
            .setDesc('Enter the OpenAI API endpoint')
            .addText(text => text
                .setPlaceholder('Enter API endpoint')
                .setValue(this.plugin.settings.apiEndpoint)
                .onChange(async (value) => {
                    this.plugin.settings.apiEndpoint = value;
                    await this.plugin.saveSettings();
                }));
    }
}