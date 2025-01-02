// יצירת כרטיסי המועמדים
function createCandidateCards() {
    const grid = document.getElementById('candidatesGrid');
    Object.entries(candidates).forEach(([id, candidate]) => {
        const card = document.createElement('div');
        card.className = 'candidate-card';
        card.innerHTML = `
            <div class="candidate-info">
                <div class="candidate-name">${candidate.name}</div>
                <div class="candidate-position">מועמדות למשרת ${candidate.position}</div>
                <div class="candidate-details">${candidate.details}</div>
                <div class="summary-preview ${candidate.summary ? '' : 'hidden'}" id="summary-preview-${id}">
                    <h4 class="summary-title">סיכום ראיון</h4>
                    <p>${candidate.summary || ''}</p>
                </div>
                <button class="read-interview-btn" onclick="openInterview(${id})" title="קרא ראיון">
                    <svg class="read-interview-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <path d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"/>
                    </svg>
                </button>
            </div>
        `;
        grid.appendChild(card);
    });
}
let currentCandidateId = null;

// פתיחת מודל הראיון
function openInterview(id) {
    currentCandidateId = id;
    const candidate = candidates[id];
    document.getElementById('modalTitle').textContent = `ראיון: ${candidate.name}`;
    document.getElementById('interviewText').textContent = candidate.interview;
    document.getElementById('interviewModal').style.display = 'block';
    document.getElementById('summaryResult').textContent = '';
    document.getElementById('summaryResult').classList.remove('visible');
    document.getElementById('saveSummaryBtn').classList.add('hidden');
}

// סגירת המודל
function closeModal() {
    document.getElementById('interviewModal').style.display = 'none';
}

// סיכום הראיון
async function summarizeInterview() {
    const text = document.getElementById('interviewText').textContent;
    const summaryType = document.getElementById('summaryType').value;
    const loadingIndicator = document.getElementById('loadingIndicator');
    const summaryResult = document.getElementById('summaryResult');
    
    loadingIndicator.classList.add('visible');
    let retries = 3;
    
    while (retries > 0) {
        try {
            const response = await fetch('http://localhost:8000/analyze', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    text: text,
                    summary_type: summaryType
                }),
            });

            const data = await response.json();
            if (data.error) {
                console.error('Server returned error:', data.error);
                if (retries > 1) {
                    retries--;
                    await new Promise(resolve => setTimeout(resolve, 1000)); // המתן שנייה
                    continue;
                }
                throw new Error(data.error);
            }
            
            summaryResult.textContent = data.result;
            summaryResult.classList.add('visible');
            document.getElementById('saveSummaryBtn').classList.remove('hidden');
            break;
            
        } catch (err) {
            retries--;
            if (retries === 0) {
                console.error('Final error:', err);
                summaryResult.textContent = 'אירעה שגיאה בתהליך הסיכום. אנא נסה שנית.';
                summaryResult.classList.add('visible');
            } else {
                console.log(`Retrying... ${retries} attempts left`);
                await new Promise(resolve => setTimeout(resolve, 1000));
            }
        }
    }
    
    loadingIndicator.classList.remove('visible');
}


function saveSummary() {
    const summaryText = document.getElementById('summaryResult').textContent;
    // עדכון האובייקט
    candidates[currentCandidateId].summary = summaryText;
    
    // עדכון התצוגה בכרטיסיה
    const summaryPreview = document.getElementById(`summary-preview-${currentCandidateId}`);
    summaryPreview.querySelector('p').textContent = summaryText;
    summaryPreview.classList.remove('hidden');
    
    // סגירת המודל
    closeModal();
    
    // הודעת אישור
    alert('הסיכום נשמר בהצלחה!');
}


// יצירת הכרטיסים בטעינת העמוד
document.addEventListener('DOMContentLoaded', createCandidateCards);