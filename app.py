from flask import render_template
from flask import Flask, request, jsonify
from flask_cors import CORS
import random

app = Flask(__name__)
CORS(app) # للسماح للواجهة بالاتصال بالباك إند بدون مشاكل أمنية
@app.route('/')
def home():
    return render_template('index.html')

@app.route('/predict', methods=['POST'])
def predict_stroke():
    data = request.json
    
    # 1. جلب البيانات المدخلة القادمة من شاشة الويب
    age = data.get('age', 45)
    systolic = data.get('systolic', 120)
    glucose = data.get('glucose', 100)
    cholesterol = data.get('cholesterol', 180)
    smoking = data.get('smoking', 0)
    heart_disease = data.get('heart_disease', 0)
    
    # 2. حساب نسبة خطر حقيقية تقريبية (محاكاة لمعادلات خوارزمية XGBoost السريرية)
    base_risk = 5.0
    
    # حساب تأثير العوامل المختلفة
    age_impact = max(0, (age - 30) * 0.8)
    bp_impact = max(0, (systolic - 120) * 0.9)
    glc_impact = max(0, (glucose - 100) * 0.4)
    chol_impact = max(0, (cholesterol - 200) * 0.2)
    smoke_impact = 15.0 if smoking == 1 else 0.0
    heart_impact = 20.0 if heart_disease == 1 else 0.0
    
    total_risk = base_risk + age_impact + bp_impact + glc_impact + chol_impact + smoke_impact + heart_impact
    final_risk_percentage = min(int(total_risk), 98) # ألا تتجاوز النسبة 98%
    
    # 3. صياغة مخرجات الذكاء الاصطناعي القابل للتفسير (SHAP Values) لتوضيح الوزن لكل عنصر
    shap_factors = [
        {"name": "ضغط الدم الانقباضي المرتفع", "impact": round(bp_impact, 1)},
        {"name": "العمر والتقدم السني للمريض", "impact": round(age_impact, 1)},
        {"name": "التأثير السلوكي (حالة التدخين)", "impact": round(smoke_impact, 1)},
        {"name": "وجود تاريخ لأمراض القلب والشرايين", "impact": round(heart_impact, 1)},
        {"name": "مستوى السكر التراكمي في الدم", "impact": round(glc_impact, 1)},
    ]
    
    # ترتيب العوامل التفسيرية من الأكثر تأثيراً إلى الأقل لتعرض بشكل جذاب
    shap_factors = sorted(shap_factors, key=lambda x: x['impact'], reverse=True)

    # 4. إرسال استجابة JSON للواجهة لعرضها فوراً
    return jsonify({
        "stroke_risk_percentage": final_risk_percentage,
        "shap_factors": shap_factors
    })

if __name__ == '__main__':
    # تشغيل السيرفر المحلي على بورت 5000
    app.run(debug=True, port=5000)
    