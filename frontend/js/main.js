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
                    <h4>סיכום ראיון:</h4>
                    <p>${candidate.summary || ''}</p>
                </div>
                <button class="button" onclick="openInterview(${id})">קרא ראיון</button>
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
        if (data.result) {
            summaryResult.textContent = data.result;
            summaryResult.classList.add('visible');
            document.getElementById('saveSummaryBtn').classList.remove('hidden');

        }
    } catch (err) {
        console.error('Error:', err);
        summaryResult.textContent = 'אירעה שגיאה בתהליך הסיכום';
        summaryResult.classList.add('visible');
    } finally {
        loadingIndicator.classList.remove('visible');
    }
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