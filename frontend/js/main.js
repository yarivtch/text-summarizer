document.addEventListener('DOMContentLoaded', () => {
    const inputText = document.getElementById('inputText');
    const summarizeBtn = document.getElementById('summarizeBtn');
    const clearBtn = document.getElementById('clearBtn');
    const summaryType = document.getElementById('summaryType');
    const loading = document.getElementById('loading');
    const error = document.getElementById('error');
    const summary = document.getElementById('summary');
    const summaryContent = document.getElementById('summaryContent');

    clearBtn.addEventListener('click', () => {
        inputText.value = '';
        summary.style.display = 'none';
        error.style.display = 'none';
        updateButtons();
    });

    summarizeBtn.addEventListener('click', async () => {
        if (!inputText.value.trim()) {
            showError('אנא הכנס טקסט לסיכום');
            return;
        }

        try {
            showLoading(true);
            const response = await fetch('http://localhost:8000/analyze', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    text: inputText.value,
                    summary_type: summaryType.value
                }),
            });

            const data = await response.json();

            if (data.error) {
                showError(data.error);
            } else {
                showSummary(data.result);
            }
        } catch (err) {
            showError('אירעה שגיאה בתהליך הסיכום');
            console.error('Error:', err);
        } finally {
            showLoading(false);
        }
    });

    inputText.addEventListener('input', updateButtons);

    function updateButtons() {
        const hasText = inputText.value.trim().length > 0;
        summarizeBtn.disabled = !hasText;
        clearBtn.disabled = !hasText;
    }

    function showError(message) {
        error.textContent = message;
        error.style.display = 'block';
        summary.style.display = 'none';
    }

    function showSummary(text) {
        summaryContent.textContent = text;
        summary.style.display = 'block';
        error.style.display = 'none';
    }

    function showLoading(show) {
        loading.style.display = show ? 'block' : 'none';
        summarizeBtn.disabled = show;
        clearBtn.disabled = show;
        summaryType.disabled = show;
    }

    // Initialize buttons state
    updateButtons();
});