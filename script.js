document.getElementById('strokeForm').addEventListener('submit', async function(e) {
    e.preventDefault();
    
    const payload = {
        age: parseInt(document.getElementById('age').value),
        systolic: parseInt(document.getElementById('systolic').value),
        glucose: parseFloat(document.getElementById('glucose').value),
        cholesterol: parseInt(document.getElementById('cholesterol').value),
        smoking: parseInt(document.getElementById('smoking').value),
        heart_disease: parseInt(document.getElementById('heart_disease').value)
    };

    try {
        const response = await fetch('/predict', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });
        
        const data = await response.json();
        
        const resultSection = document.getElementById('result-section');
        resultSection.classList.remove('hidden');
        
        const pct = data.stroke_risk_percentage;
        document.getElementById('resultPercentage').innerText = pct + '%';
        
        const riskLabel = document.getElementById('riskLevelLabel');
        const gauge = document.getElementById('gaugeContainer');
        
        if (pct >= 70) {
            riskLabel.innerText = 'خطر مرتفع جداً';
            riskLabel.className = 'mt-6 px-6 py-2 rounded-full font-bold text-sm bg-red-50 text-red-600';
            gauge.className = 'relative w-44 h-44 flex items-center justify-center rounded-full border-8 border-red-500';
        } else if (pct >= 40) {
            riskLabel.innerText = 'خطر متوسط';
            riskLabel.className = 'mt-6 px-6 py-2 rounded-full font-bold text-sm bg-yellow-50 text-yellow-600';
            gauge.className = 'relative w-44 h-44 flex items-center justify-center rounded-full border-8 border-yellow-500';
        } else {
            riskLabel.innerText = 'خطر منخفض / آمن';
            riskLabel.className = 'mt-6 px-6 py-2 rounded-full font-bold text-sm bg-green-50 text-green-600';
            gauge.className = 'relative w-44 h-44 flex items-center justify-center rounded-full border-8 border-green-500';
        }

        const shapContainer = document.getElementById('shapFactorsContainer');
        shapContainer.innerHTML = '';
        
        data.shap_factors.forEach(factor => {
            const factorHtml = `
                <div class="space-y-1">
                    <div class="flex justify-between text-sm font-medium text-gray-700">
                        <span>${factor.name}</span>
                        <span class="text-blue-600 font-bold">${factor.impact >= 0 ? '+' : ''}${factor.impact}%</span>
                    </div>
                    <div class="w-full bg-gray-100 h-2.5 rounded-full overflow-hidden">
                        <div class="h-full rounded-full ${factor.impact >= 0 ? 'bg-red-500' : 'bg-green-500'}" style="width: ${Math.min(Math.abs(factor.impact) * 2, 100)}%"></div>
                    </div>
                </div>
            `;
            shapContainer.insertAdjacentHTML('beforeend', factorHtml);
        });

        resultSection.scrollIntoView({ behavior: 'smooth' });

    } catch (error) {
        alert('حدث خطأ أثناء الاتصال بالسيرفر السحابي، يرجى التأكد من أن خادم Render قيد التشغيل وLive حالياً.');
    }
});