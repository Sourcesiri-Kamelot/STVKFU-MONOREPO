document.addEventListener('DOMContentLoaded', () => {
    // Existing DOM Elements
    const chatContainer = document.getElementById('chatContainer');
    const userInput = document.getElementById('userInput');
    const sendButton = document.getElementById('sendButton');
    const clearChatButton = document.getElementById('clearChatButton');
    
    const pdfUpload = document.getElementById('pdfUpload');
    const uploadButton = document.getElementById('uploadButton');
    const pdfStatusDiv = document.getElementById('pdfStatus');
    const pdfNameSpan = document.getElementById('pdfName');
    const pdfPageCountSpan = document.getElementById('pdfPageCount');
    const clearPdfContextBtn = document.getElementById('clearPdfContext');

    const pasteCodeButton = document.getElementById('pasteCodeButton');
    const codePasteModal = document.getElementById('codePasteModal');
    const closeCodeModalBtn = document.getElementById('closeCodeModalBtn');
    const codePasteInput = document.getElementById('codePasteInput');
    const cancelCodePaste = document.getElementById('cancelCodePaste');
    const submitCodePaste = document.getElementById('submitCodePaste');
    const codeContextStatusDiv = document.getElementById('codeContextStatus');
    const clearCodeContextBtn = document.getElementById('clearCodeContext');
    
    const playgroundButton = document.getElementById('playgroundButton');
    const playgroundModal = document.getElementById('playgroundModal');
    const closePlaygroundModalBtn = document.getElementById('closePlaygroundModalBtn');
    const htmlCodeInput = document.getElementById('htmlCode');
    const cssCodeInput = document.getElementById('cssCode');
    const jsCodeInput = document.getElementById('jsCode');
    const previewFrame = document.getElementById('previewFrame');
    const runPreviewButton = document.getElementById('runPreviewButton');

    const errorMessageDiv = document.getElementById('errorMessage');
    const quickPromptsContainer = document.getElementById('quickPromptsContainer');

    // New SaaS UI Placeholder Elements
    const myAccountButton = document.getElementById('myAccountButton');
    const pricingModal = document.getElementById('pricingModal');
    const closePricingModalBtn = document.getElementById('closePricingModalBtn');
    const freeTierUsageStatusDiv = document.getElementById('freeTierUsageStatus');
    const questionsAskedSpan = document.getElementById('questionsAsked');
    const maxQuestionsSpan = document.getElementById('maxQuestions'); // For display
    // Placeholder account details in pricing modal
    const currentUserPlanSpan = document.getElementById('currentUserPlan');
    const userQuestionsUsedSpan = document.getElementById('userQuestionsUsed');


    // App State
    let pdfTextContext = ""; 
    let codeTextContext = "";
    const initialBotGreeting = "Hello! I'm DevSydekik. Ask coding questions, upload a PDF, paste code for analysis, or try the Code Playground. While I can't connect to your local environment, I can generate commands, explain errors, and help with code!";
    const examplePrompts = [
        "Explain JavaScript closures.",
        "How do I create a virtual environment in Python?",
        "My CSS isn't applying, what should I check?",
        "Generate a simple HTML boilerplate."
    ];
    let questionsAskedToday = 0;
    const MAX_FREE_QUESTIONS = 2;
    maxQuestionsSpan.textContent = MAX_FREE_QUESTIONS; // Update display

    // --- Initialization ---
    function initializeApp() {
        displayMessage(initialBotGreeting, "bot");
        renderQuickPrompts();
        updateUsageDisplay();
    }

    function renderQuickPrompts() {
        quickPromptsContainer.innerHTML = ''; 
        examplePrompts.forEach(promptText => {
            const button = document.createElement('button');
            button.classList.add('quick-prompt-btn', 'px-3', 'py-1', 'rounded-md', 'text-xs');
            button.textContent = promptText;
            button.onclick = () => {
                userInput.value = promptText;
                userInput.focus();
            };
            quickPromptsContainer.appendChild(button);
        });
    }

    function updateUsageDisplay() {
        questionsAskedSpan.textContent = questionsAskedToday;
        userQuestionsUsedSpan.textContent = `${questionsAskedToday} / ${MAX_FREE_QUESTIONS}`; // Update in modal too
        if (questionsAskedToday >= MAX_FREE_QUESTIONS) {
            freeTierUsageStatusDiv.innerHTML = `Free Tier: <strong class="text-red-400">Daily limit reached (${MAX_FREE_QUESTIONS}/${MAX_FREE_QUESTIONS}).</strong> <button id="upgradeNowBtn" class="text-yellow-400 hover:text-yellow-300 underline ml-1 text-xs">Upgrade Now?</button>`;
            userInput.disabled = true;
            sendButton.disabled = true;
            userInput.placeholder = "Daily free limit reached. Upgrade for more.";
            document.getElementById('upgradeNowBtn')?.addEventListener('click', () => pricingModal.style.display = 'flex');
        } else {
            freeTierUsageStatusDiv.innerHTML = `Free Tier: <span id="questionsAsked" class="font-semibold">${questionsAskedToday}</span> of <span id="maxQuestions" class="font-semibold">${MAX_FREE_QUESTIONS}</span> questions asked today.`;
            userInput.disabled = false;
            sendButton.disabled = false;
            userInput.placeholder = "Ask a coding question...";
        }
    }


    // --- Event Listeners ---
    sendButton.addEventListener('click', sendMessage);
    userInput.addEventListener('keypress', (e) => { if (e.key === 'Enter') sendMessage(); });
    
    clearChatButton.addEventListener('click', () => {
        chatContainer.innerHTML = ''; 
        // questionsAskedToday = 0; // Resetting for demo purposes, real app would persist this daily
        initializeApp(); 
        displayMessage("Chat cleared.", "bot"); 
    });

    uploadButton.addEventListener('click', () => pdfUpload.click());
    pdfUpload.addEventListener('change', handlePdfUpload);
    clearPdfContextBtn.addEventListener('click', () => {
        pdfTextContext = "";
        pdfStatusDiv.classList.add('hidden');
        pdfUpload.value = "";
        displayMessage("PDF context cleared.", "bot");
    });

    pasteCodeButton.addEventListener('click', () => { codePasteModal.style.display = 'flex'; codePasteInput.focus(); });
    closeCodeModalBtn.addEventListener('click', () => { codePasteModal.style.display = 'none'; });
    cancelCodePaste.addEventListener('click', () => { codePasteModal.style.display = 'none'; });
    window.addEventListener('click', (event) => { if (event.target == codePasteModal) codePasteModal.style.display = 'none'; });
    
    submitCodePaste.addEventListener('click', () => {
        codeTextContext = codePasteInput.value.trim();
        if (codeTextContext) {
            codeContextStatusDiv.classList.remove('hidden');
            displayMessage("Code snippet context loaded. You can now ask questions about it.", "bot");
        } else {
            codeContextStatusDiv.classList.add('hidden');
        }
        codePasteModal.style.display = 'none';
    });
    clearCodeContextBtn.addEventListener('click', () => {
        codeTextContext = "";
        codePasteInput.value = "";
        codeContextStatusDiv.classList.add('hidden');
        displayMessage("Pasted code context cleared.", "bot");
    });

    playgroundButton.addEventListener('click', () => { playgroundModal.style.display = 'flex'; });
    closePlaygroundModalBtn.addEventListener('click', () => { playgroundModal.style.display = 'none'; });
    window.addEventListener('click', (event) => { if (event.target == playgroundModal) playgroundModal.style.display = 'none'; });
    runPreviewButton.addEventListener('click', updatePreview);

    // Pricing Modal Listeners
    myAccountButton.addEventListener('click', () => { pricingModal.style.display = 'flex'; });
    closePricingModalBtn.addEventListener('click', () => { pricingModal.style.display = 'none'; });
    window.addEventListener('click', (event) => { if (event.target == pricingModal) pricingModal.style.display = 'none'; });
    
    document.querySelectorAll('.subscribe-btn').forEach(button => {
        button.addEventListener('click', (e) => {
            const plan = e.target.dataset.plan;
            alert(`Placeholder: You clicked to subscribe to the "${plan}" plan. Real payment integration needed!`);
            // In a real app, this would initiate the payment flow with a backend.
            pricingModal.style.display = 'none';
        });
    });


    // --- Message Handling ---
    function displayMessage(text, sender) {
        const messageDiv = document.createElement('div');
        messageDiv.classList.add('message', 'p-3', 'rounded-lg', 'shadow', sender === 'user' ? 'user-message' : 'bot-message');
        
        if (sender === 'bot') {
            let htmlContent = text;
            htmlContent = htmlContent.replace(/```(\w*\n)?([\s\S]*?)```/g, (match, lang, code) => {
                const language = lang ? lang.trim() : '';
                const escapedCode = code.replace(/</g, "&lt;").replace(/>/g, "&gt;").trim();
                const langClass = language ? `language-${language}` : '';
                return `<pre class="${langClass}"><button class="copy-code-btn">Copy</button><code>${escapedCode}</code></pre>`;
            });
            htmlContent = htmlContent.replace(/`([^`]+)`/g, (match, code) => {
                const escapedCode = code.replace(/</g, "&lt;").replace(/>/g, "&gt;");
                return `<code>${escapedCode}</code>`;
            });
            htmlContent = htmlContent.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
            htmlContent = htmlContent.replace(/\*(.*?)\*/g, '<em>$1</em>');
            htmlContent = htmlContent.replace(/\n/g, '<br>');
            htmlContent = htmlContent.replace(/<pre(.*?)>(.*?)<\/pre>/gs, (match, preAttrs, preContent) => {
                return `<pre${preAttrs}>${preContent.replace(/<br\s*\/?>/gi, '\n')}</pre>`;
            });
            messageDiv.innerHTML = htmlContent;
            
            messageDiv.querySelectorAll('pre code').forEach((block) => { hljs.highlightElement(block); });
            messageDiv.querySelectorAll('.copy-code-btn').forEach(button => {
                button.addEventListener('click', (e) => {
                    const codeElement = e.target.nextElementSibling;
                    const codeToCopy = codeElement.textContent;
                    navigator.clipboard.writeText(codeToCopy).then(() => {
                        e.target.textContent = 'Copied!';
                        setTimeout(() => { e.target.textContent = 'Copy'; }, 2000);
                    }).catch(err => {
                        console.error('Failed to copy code: ', err);
                        const textArea = document.createElement("textarea");
                        textArea.value = codeToCopy;
                        document.body.appendChild(textArea);
                        textArea.focus(); textArea.select();
                        try {
                            document.execCommand('copy');
                            e.target.textContent = 'Copied!';
                            setTimeout(() => { e.target.textContent = 'Copy'; }, 2000);
                        } catch (execErr) {
                            console.error('Fallback copy failed: ', execErr);
                            e.target.textContent = 'Error';
                        }
                        document.body.removeChild(textArea);
                    });
                });
            });
        } else {
            messageDiv.textContent = text;
        }
        chatContainer.appendChild(messageDiv);
        chatContainer.scrollTop = chatContainer.scrollHeight;
    }

    function showLoadingIndicator() { 
        const loadingDiv = document.createElement('div');
        loadingDiv.id = 'loadingIndicator';
        loadingDiv.classList.add('message', 'bot-message', 'p-3', 'rounded-lg', 'shadow', 'flex', 'items-center');
        loadingDiv.innerHTML = `<div class="loading-dots"><span>.</span><span>.</span><span>.</span></div><span class="ml-2 text-sm">DevSydekik is thinking...</span>`;
        chatContainer.appendChild(loadingDiv);
        chatContainer.scrollTop = chatContainer.scrollHeight;
    }
    function removeLoadingIndicator() { 
        const loadingIndicator = document.getElementById('loadingIndicator');
        if (loadingIndicator) loadingIndicator.remove();
    }
    function displayError(message) { 
        errorMessageDiv.textContent = message;
        errorMessageDiv.classList.remove('hidden');
        setTimeout(() => { errorMessageDiv.classList.add('hidden'); errorMessageDiv.textContent = ''; }, 7000);
    }

    async function sendMessage() {
        if (questionsAskedToday >= MAX_FREE_QUESTIONS) {
            displayError("You've reached your daily free question limit. Please upgrade for more.");
            pricingModal.style.display = 'flex'; // Show pricing modal
            return;
        }

        const messageText = userInput.value.trim();
        if (!messageText) return;

        displayMessage(messageText, 'user');
        userInput.value = '';
        showLoadingIndicator();
        errorMessageDiv.classList.add('hidden');

        // Increment question count for free tier (simulated)
        questionsAskedToday++;
        updateUsageDisplay();


        try {
            // AI Prompt (same as v5, no changes needed here for this UI update)
            let prompt = `You are DevSydekik, an expert AI coding assistant for beginner to advanced developers. 
            Your primary goal is to provide clear, concise, and accurate answers to coding questions. 
            Explain concepts simply. Provide well-formatted code examples using Markdown code blocks.
            
            If the user provides code, analyze it: explain what it does, identify potential issues (syntax, logic, style, security), and suggest improvements or refactoring options.
            If the user asks a vague question about their code not working (e.g., "My code is broken", "It doesn't run"), DO NOT just say you need more info. INSTEAD, guide them by asking specific clarifying questions, such as:
            - "Okay, I can try to help! Could you please paste the code snippet that's causing trouble?"
            - "What error message are you seeing, if any? Please share the full error."
            - "What were you expecting the code to do, and what is it actually doing?"
            - "Which programming language and version are you using?"
            Be proactive in guiding them to provide the necessary details for you to help effectively.

            IMPORTANT ON TERMINAL/IDE: You CANNOT directly connect to or control a user's local terminal or IDE. 
            If the user asks about direct terminal/IDE interaction, clearly explain this limitation due to web browser security. 
            Instead, offer to help by:
            1. Generating terminal commands for them to copy and paste.
            2. Explaining terminal output or error messages if they paste them to you.
            3. Generating code snippets for them to use in their IDE (they can also try these in the 'Code Playground' feature of this app).
            4. Explaining IDE features or debugging strategies if they describe their problem or paste relevant error messages/code.
            Encourage them to provide the necessary information.

            FORMATTING:
            - Use Markdown for all formatting.
            - For code blocks, use triple backticks. Specify the language if known (e.g., \`\`\`python ... \`\`\`).
            - Use bold (\`**text**\`) and italics (\`*text*\`) for emphasis.
            - Use lists (\`-\` or \`*\` or \`1.\`) for enumerations.

            CONTEXT: If context from a PDF document or a pasted code snippet is provided below, use it to enhance your answer and make it more relevant. Explicitly mention if you are using the provided document or code context.`;

            if (pdfTextContext) {
                prompt += `\n\n--- Provided PDF Document Context Start ---\n${pdfTextContext}\n--- Provided PDF Document Context End ---`;
            }
            if (codeTextContext) {
                prompt += `\n\n--- Provided Code Snippet Context Start ---\n${codeTextContext}\n--- Provided Code Snippet Context End ---`;
            }
            prompt += `\n\nUser Question: ${messageText}`;
            
            let chatHistory = []; 
            chatHistory.push({ role: "user", parts: [{ text: prompt }] });
            const payload = { contents: chatHistory };
            const apiKey = ""; 
            const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`;

            const response = await fetch(apiUrl, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });
            removeLoadingIndicator();

            if (!response.ok) {
                const errorData = await response.json();
                console.error('API Error:', errorData);
                displayError(`Error from AI: ${errorData.error?.message || 'Unknown error'}. Status: ${response.status}`);
                displayMessage(`Sorry, I encountered an error trying to respond. (Status: ${response.status})`, 'bot');
                // Do not decrement questionsAskedToday on API error, as the "usage" still occurred.
                return;
            }
            const result = await response.json();

            if (result.candidates && result.candidates.length > 0 &&
                result.candidates[0].content && result.candidates[0].content.parts &&
                result.candidates[0].content.parts.length > 0) {
                const botResponse = result.candidates[0].content.parts[0].text;
                displayMessage(botResponse, 'bot');
            } else {
                console.error('Unexpected API response structure:', result);
                displayError('Received an unexpected response from the AI.');
                displayMessage("Sorry, I couldn't formulate a response properly.", 'bot');
            }
        } catch (error) {
            removeLoadingIndicator();
            console.error('Failed to send message:', error);
            displayError(`Network or script error: ${error.message}`);
            displayMessage("Oops! Something went wrong on my end. Please try again.", 'bot');
        }
    }

    // --- PDF Handling ---
    async function handlePdfUpload(event) { 
        const file = event.target.files[0];
        if (file && file.type === "application/pdf") {
            pdfNameSpan.textContent = "Processing...";
            pdfPageCountSpan.textContent = "";
            pdfStatusDiv.classList.remove('hidden');
            pdfTextContext = ""; 
            try {
                const arrayBuffer = await file.arrayBuffer();
                const pdf = await pdfjsLib.getDocument({data: arrayBuffer}).promise;
                pdfNameSpan.textContent = file.name;
                pdfPageCountSpan.textContent = pdf.numPages;
                let fullText = "";
                for (let i = 1; i <= pdf.numPages; i++) {
                    const page = await pdf.getPage(i);
                    const textContent = await page.getTextContent();
                    const pageText = textContent.items.map(item => item.str).join(" ");
                    fullText += pageText + "\n\n"; 
                    if (i % 5 === 0 || i === pdf.numPages) {
                         pdfStatusDiv.querySelector('#pdfName').textContent = `${file.name} (Page ${i}/${pdf.numPages})...`;
                    }
                }
                pdfTextContext = fullText.trim();
                pdfNameSpan.textContent = file.name;
                displayMessage(`Successfully loaded and processed "${file.name}". You can now ask questions related to its content.`, 'bot');
            } catch (error) {
                console.error("Error processing PDF:", error);
                pdfTextContext = "";
                pdfNameSpan.textContent = `Error loading ${file.name}.`;
                pdfPageCountSpan.textContent = "";
                displayError(`Failed to process PDF: ${error.message}`);
            }
        } else if (file) {
            displayError("Invalid file type. Please upload a PDF.");
            pdfUpload.value = ""; 
        }
    }
    
    // --- Playground Logic ---
    function updatePreview() {
        const htmlContent = htmlCodeInput.value;
        const cssContent = cssCodeInput.value;
        const jsContent = jsCodeInput.value;

        const combinedOutput = `
            <html>
            <head>
                <style>${cssContent}</style>
            </head>
            <body>
                ${htmlContent}
                <script>${jsContent}<\/script> 
            </body>
            </html>
        `;
        previewFrame.srcdoc = combinedOutput;
    }

    // Initialize App
    hljs.configure({ ignoreUnescapedHTML: true });
    initializeApp();

});
