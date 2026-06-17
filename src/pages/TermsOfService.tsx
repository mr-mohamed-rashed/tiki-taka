import { Shield, FileText, CheckCircle, AlertTriangle, Scale, Settings } from 'lucide-react';
import TikiTakaHeader from '../components/tikitaka/TikiTakaHeader';
import TikiTakaFooter from '../components/tikitaka/TikiTakaFooter';
import { useLanguage } from '../context/LanguageContext';

export default function TermsOfService() {
  const { lang } = useLanguage();

  return (
    <div className="min-h-screen bg-[#0A0A0A] text-white selection:bg-primary/30 font-sans" dir={lang === 'ar' ? 'rtl' : 'ltr'}>
      <TikiTakaHeader />

      <main className="pt-24 pb-20 px-4 md:px-8">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="mb-12 text-center space-y-4">
            <div className="inline-flex items-center justify-center p-4 rounded-full bg-primary/10 text-primary mb-2 shadow-neon">
              <Scale size={40} />
            </div>
            <h1 className="text-4xl md:text-5xl font-display font-bold">شروط وأحكام استخدام منصة "تيكي تاكا"</h1>
            <p className="text-[#A1A1AA] text-lg max-w-2xl mx-auto leading-relaxed">
              مرحباً بكم في منصة تيكي تاكا (Tiki-Taka). تحكم هذه الشروط والأحكام استخدامكم للموقع وكافة الخدمات والمعلومات المتاحة من خلاله. يُرجى قراءة هذه الصفحة بعناية، حيث إن استخدامكم للموقع، أو إنشاء حساب فيه، أو تصفحه يُعد إقراراً وموافقة كاملة منكم على الالتزام بهذه الشروط.
            </p>
          </div>

          {/* Content */}
          <div className="space-y-8 bg-[#111113] border border-white/5 p-6 md:p-10 rounded-2xl shadow-elevated">
            
            <section className="space-y-4">
              <div className="flex items-center gap-3 text-primary">
                <CheckCircle size={24} />
                <h2 className="text-2xl font-bold text-white">1. قبول الشروط</h2>
              </div>
              <p className="text-[#A1A1AA] leading-relaxed text-lg mr-9">
                باستخدامك لمنصة "تيكي تاكا"، فإنك توافق على الالتزام بهذه الشروط والأحكام وجميع القوانين واللوائح المعمول بها. إذا كنت لا توافق على أي جزء من هذه الشروط، فيجب عليك التوقف فوراً عن استخدام الموقع.
              </p>
            </section>

            <section className="space-y-4">
              <div className="flex items-center gap-3 text-primary">
                <Shield size={24} />
                <h2 className="text-2xl font-bold text-white">2. حسابات المستخدمين وأمن الحساب</h2>
              </div>
              <p className="text-[#A1A1AA] leading-relaxed text-lg mr-9">
                عند إنشاء حساب على منصة "تيكي تاكا"، فإنك تتعهد وتوافق على الآتي:
              </p>
              <ul className="list-disc list-outside text-[#A1A1AA] space-y-3 mr-14 text-lg">
                <li><strong className="text-white">صحة البيانات:</strong> تقديم معلومات دقيقة، وكاملة، ومحدثة أثناء عملية التسجيل.</li>
                <li><strong className="text-white">سرية الحساب:</strong> الحفاظ على سرية بيانات تسجيل الدخول الخاصة بك (اسم المستخدم وكلمة المرور)، وتتحمل المسؤولية الكاملة عن كافة الأنشطة التي تتم عبر حسابك.</li>
                <li><strong className="text-white">الإخطار الفوري:</strong> إبلاغ إدارة الموقع فوراً في حال اكتشافك لأي استخدام غير مصرح به لحسابك أو أي خرق أمني آخر.</li>
                <li><strong className="text-white">إغلاق الحساب:</strong> تحتفظ منصة "تيكي تاكا" بالحق الكامل، وفقاً لتقديرها الخاص، في تعليق أو إنهاء حسابك في أي وقت ودون إشعار مسبق، إذا تبين انتهاكك لأي من هذه الشروط.</li>
              </ul>
            </section>

            <section className="space-y-4">
              <div className="flex items-center gap-3 text-primary">
                <FileText size={24} />
                <h2 className="text-2xl font-bold text-white">3. المساحات الإعلانية وأطراف ثالثة (Advertising)</h2>
              </div>
              <ul className="list-disc list-outside text-[#A1A1AA] space-y-3 mr-14 text-lg">
                <li><strong className="text-white">المحتوى الإعلاني:</strong> يتضمن الموقع مساحات إعلانية تدار بواسطة شبكات إعلانية تابعة لأطراف ثالثة (مثل Google AdSense أو غيرها). لا تتحمل المنصة أي مسؤولية عن محتوى هذه الإعلانات، أو المنتجات، أو الخدمات المعروضة فيها.</li>
                <li><strong className="text-white">مسؤولية الشراء/التعامل:</strong> أي تعامل تجاري، أو شراء منتجات، أو اشتراك في خدمات يتم عبر الضغط على هذه الإعلانات يكون على مسؤولية المستخدم الشخصية الكاملة، ولا تعد منصة "تيكي تاكا" طرفاً في هذه العلاقة أو وسيطاً فيها.</li>
              </ul>
            </section>

            <section className="space-y-4">
              <div className="flex items-center gap-3 text-primary">
                <Shield size={24} />
                <h2 className="text-2xl font-bold text-white">4. الملكية الفكرية وحقوق النشر</h2>
              </div>
              <p className="text-[#A1A1AA] leading-relaxed text-lg mr-9">
                جميع المحتويات المتاحة على هذا الموقع، بما في ذلك على سبيل المثال لا الحصر (النصوص، التصاميم، الشعارات، الأيقونات، البرمجيات، الواجهات، والترتيب الهيكلي للبيانات) هي ملكية حصرية لمنصة "تيكي تاكا" ومحمية بموجب قوانين الملكية الفكرية وحقوق النشر الدولية.
              </p>
              <p className="text-[#A1A1AA] leading-relaxed text-lg mr-9">
                يُحظر تماماً نسخ، أو إعادة إنتاج، أو توزيع، أو تعديل، أو استغلال أي جزء من محتوى الموقع لأغراض تجارية دون الحصول على إذن كتابي مسبق وصريح من إدارة المنصة.
              </p>
            </section>

            <section className="space-y-4">
              <div className="flex items-center gap-3 text-primary">
                <AlertTriangle size={24} />
                <h2 className="text-2xl font-bold text-white">5. إخلاء المسؤولية عن البيانات والمعلومات (Disclaimer)</h2>
              </div>
              <ul className="list-disc list-outside text-[#A1A1AA] space-y-3 mr-14 text-lg">
                <li><strong className="text-white">دقة البيانات:</strong> تُبذل منصة "تيكي تاكا" قصارى جهدها لتوفير نتائج المباريات المباشرة، الإحصائيات، الترتيب الفوري، والتعليقات بدقة وسرعة عالية. ومع ذلك، يتم تقديم كافة المعلومات والبيانات "كما هي" دون أي ضمانات من أي نوع، صريحة أو ضمنية، بشأن دقتها، أو اكتمالها، أو تحديثها اللحظي.</li>
                <li><strong className="text-white">الأخطاء التقنية:</strong> لا تتحمل المنصة المسؤولية عن أي تأخير في تحديث البيانات، أو انقطاع الخدمة، أو وجود أخطاء تقنية ناتجة عن تحديثات البث أو مزودي البيانات الخارجيين.</li>
                <li><strong className="text-white">مسؤولية القرار:</strong> لا تتحمل المنصة أي مسؤولية قانونية أو مالية عن أي خسائر أو أضرار (مباشرة أو غير مباشرة) قد تلحق بالمستخدم نتيجة اعتماده على المعلومات الواردة في الموقع، بما في ذلك القرارات المتعلقة بالتوقعات، أو المراهنات، أو أي أنشطة مشابهة.</li>
              </ul>
            </section>

            <section className="space-y-4">
              <div className="flex items-center gap-3 text-primary">
                <AlertTriangle size={24} />
                <h2 className="text-2xl font-bold text-white">6. الاستخدام المقبول والسلوك المحظور</h2>
              </div>
              <p className="text-[#A1A1AA] leading-relaxed text-lg mr-9">
                يتعهد المستخدم باستخدام الموقع للأغراض المشروعة فقط، ويُحظر تماماً القيام بأي من الأفعال التالية:
              </p>
              <ul className="list-disc list-outside text-[#A1A1AA] space-y-3 mr-14 text-lg">
                <li>استخدام أي أدوات آلية (مثل الروبوتات أو أدوات كشط البيانات Scrapers) لجمع أو سحب المعلومات من الموقع دون إذن كتابي.</li>
                <li>محاولة اختراق الموقع، أو تعطيل خوادمه، أو إرسال برمجيات خبيثة أو فيروسات.</li>
                <li>استخدام الخدمات بطريقة قد تؤدي إلى إلحاق الضرر بالبنية التحتية للموقع أو التأثير سلباً على تجربة المستخدمين الآخرين.</li>
              </ul>
            </section>

            <section className="space-y-4">
              <div className="flex items-center gap-3 text-primary">
                <Settings size={24} />
                <h2 className="text-2xl font-bold text-white">7. التعديلات على شروط الخدمة</h2>
              </div>
              <p className="text-[#A1A1AA] leading-relaxed text-lg mr-9">
                تحتفظ إدارة منصة "تيكي تاكا" بالحق الكامل في تعديل، أو تغيير، أو تحديث هذه الشروط والأحكام في أي وقت ودون إشعار مسبق. وتصبح هذه التعديلات نافذة فور نشرها على هذه الصفحة. يُنصح المستخدمون بمراجعة هذه الصفحة بشكل دوري للوقوف على أي تحديثات.
              </p>
            </section>

            <section className="space-y-4">
              <div className="flex items-center gap-3 text-primary">
                <Scale size={24} />
                <h2 className="text-2xl font-bold text-white">8. القانون الواجب التطبيق والولاية القضائية</h2>
              </div>
              <p className="text-[#A1A1AA] leading-relaxed text-lg mr-9">
                تخضع هذه الشروط والأحكام وتُفسر وفقاً للقوانين واللوائح السارية في الدولة الحاضنة للموقع، وتخضع أي نزاعات قد تنشأ عن استخدام المنصة للاختصاص القضائي الحصري للمحاكم المختصة فيها.
              </p>
            </section>

          </div>
        </div>
      </main>

      <TikiTakaFooter />
    </div>
  );
}
