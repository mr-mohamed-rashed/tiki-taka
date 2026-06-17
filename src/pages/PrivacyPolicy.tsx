import { Shield, Eye, Settings, Cookie, Lock, Link as LinkIcon, RefreshCw, Mail } from 'lucide-react';
import TikiTakaHeader from '../components/tikitaka/TikiTakaHeader';
import TikiTakaFooter from '../components/tikitaka/TikiTakaFooter';
import { useLanguage } from '../context/LanguageContext';

export default function PrivacyPolicy() {
  const { lang } = useLanguage();

  return (
    <div className="min-h-screen bg-[#0A0A0A] text-white selection:bg-primary/30 font-sans" dir={lang === 'ar' ? 'rtl' : 'ltr'}>
      <TikiTakaHeader />

      <main className="pt-24 pb-20 px-4 md:px-8">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="mb-12 text-center space-y-4">
            <div className="inline-flex items-center justify-center p-4 rounded-full bg-primary/10 text-primary mb-2 shadow-neon">
              <Shield size={40} />
            </div>
            <h1 className="text-4xl md:text-5xl font-display font-bold">سياسة الخصوصية لمنصة "تيكي تاكا"</h1>
            <h2 className="text-xl md:text-2xl text-primary font-medium mt-2">التابعة لشركة سفاري مصر (M M R)</h2>
            <p className="text-[#A1A1AA] text-lg max-w-2xl mx-auto leading-relaxed mt-4">
              تُولي منصة تيكي تاكا (Tiki-Taka)، المملوكة والمدارة من قِبل شركة سفاري مصر (M M R)، أهمية قصوى لخصوصية زوارها ومستخدميها. توضح هذه الوثيقة أنواع البيانات الشخصية التي نجمعها، وكيفية استخدامها وحمايتها، وذلك لضمان تجربة تصفح آمنة وشفافة.
            </p>
          </div>

          {/* Content */}
          <div className="space-y-8 bg-[#111113] border border-white/5 p-6 md:p-10 rounded-2xl shadow-elevated">
            
            <section className="space-y-4">
              <div className="flex items-center gap-3 text-primary">
                <Eye size={24} />
                <h2 className="text-2xl font-bold text-white">1. البيانات التي نجمعها</h2>
              </div>
              <p className="text-[#A1A1AA] leading-relaxed text-lg mr-9">
                عند استخدامك لمنصتنا، قد نقوم بجمع البيانات التالية:
              </p>
              <ul className="list-disc list-outside text-[#A1A1AA] space-y-3 mr-14 text-lg">
                <li><strong className="text-white">بيانات الحساب الشخصي:</strong> عند قيامك بتسجيل الدخول، نجمع المعلومات التي تزودنا بها مثل (الاسم، البريد الإلكتروني، وصورة الملف الشخصي إن وجدت).</li>
                <li><strong className="text-white">بيانات التصفح التلقائية:</strong> وتشمل عنوان بروتوكول الإنترنت (IP Address)، نوع المتصفح، نظام التشغيل، وقت وتاريخ الزيارة، والصفحات التي قمت باستعراضها داخل الموقع.</li>
              </ul>
            </section>

            <section className="space-y-4">
              <div className="flex items-center gap-3 text-primary">
                <Settings size={24} />
                <h2 className="text-2xl font-bold text-white">2. كيف نستخدم بياناتك؟</h2>
              </div>
              <p className="text-[#A1A1AA] leading-relaxed text-lg mr-9">
                نستخدم المعلومات التي نجمعها للأغراض التالية:
              </p>
              <ul className="list-disc list-outside text-[#A1A1AA] space-y-3 mr-14 text-lg">
                <li>إدارة حسابك الشخصي وتخصيص تجربتك داخل موقع "تيكي تاكا".</li>
                <li>تحسين أداء الموقع، وتطوير المحتوى الرياضي والإحصائي بناءً على تفضيلات المستخدمين.</li>
                <li>التواصل معك لإرسال تحديثات هامة، أو إشعارات متعلقة بحسابك، أو الرد على استفساراتك.</li>
              </ul>
            </section>

            <section className="space-y-4">
              <div className="flex items-center gap-3 text-primary">
                <Cookie size={24} />
                <h2 className="text-2xl font-bold text-white">3. ملفات تعريف الارتباط (Cookies) والإعلانات</h2>
              </div>
              <ul className="list-disc list-outside text-[#A1A1AA] space-y-3 mr-14 text-lg">
                <li><strong className="text-white">ملفات الكوكيز:</strong> نستخدم ملفات تعريف الارتباط لتخزين معلومات حول تفضيلات الزوار، وتسجيل معلومات محددة للمستخدم حول الصفحات التي يصل إليها أو يزورها، وذلك لتقديم خدمة مخصصة.</li>
                <li><strong className="text-white">إعلانات الأطراف الثالثة:</strong> يستعين موقع "تيكي تاكا" بشركات إعلانات خارجية (مثل Google AdSense) لعرض الإعلانات عندما تزور موقعنا. تستخدم هذه الشركات ملفات تعريف الارتباط (مثل ملف تعريف الارتباط DART من جوجل) لخدمة الإعلانات بناءً على زياراتك لموقعنا والمواقع الأخرى على الإنترنت.</li>
                <li><strong className="text-white">إلغاء الاشتراك:</strong> يمكن للمستخدمين اختيار إلغاء استخدام ملف تعريف الارتباط DART بزيارة سياسة الخصوصية الخاصة بشبكة جوجل الإعلانية والمحتوى.</li>
              </ul>
            </section>

            <section className="space-y-4">
              <div className="flex items-center gap-3 text-primary">
                <Lock size={24} />
                <h2 className="text-2xl font-bold text-white">4. حماية وأمن البيانات</h2>
              </div>
              <p className="text-[#A1A1AA] leading-relaxed text-lg mr-9">
                تلتزم شركة سفاري مصر (M M R) بتطبيق أعلى معايير الأمان الفنية والتنظيمية لحماية بياناتك الشخصية من الوصول غير المصرح به، أو التعديل، أو الإفشاء، أو الإتلاف. نحن لا نقوم ببيع، أو المتاجرة، أو تأجير بيانات المستخدمين الشخصية لأي أطراف ثالثة.
              </p>
            </section>

            <section className="space-y-4">
              <div className="flex items-center gap-3 text-primary">
                <LinkIcon size={24} />
                <h2 className="text-2xl font-bold text-white">5. روابط المواقع الخارجية</h2>
              </div>
              <p className="text-[#A1A1AA] leading-relaxed text-lg mr-9">
                قد يحتوي موقعنا على روابط لمواقع أخرى (مثل شركاء الإعلانات أو مصادر الأخبار). يُرجى العلم أننا لا نملك أي سيطرة على سياسات الخصوصية الخاصة بتلك المواقع، وننصحك بقراءة سياسة الخصوصية لكل موقع تزوره.
              </p>
            </section>

            <section className="space-y-4">
              <div className="flex items-center gap-3 text-primary">
                <RefreshCw size={24} />
                <h2 className="text-2xl font-bold text-white">6. التعديلات على سياسة الخصوصية</h2>
              </div>
              <p className="text-[#A1A1AA] leading-relaxed text-lg mr-9">
                تحتفظ شركة سفاري مصر (M M R) بالحق في تحديث أو تعديل سياسة الخصوصية هذه في أي وقت. وعند إجراء أي تغييرات، سيتم تحديث تاريخ "آخر تحديث" في أسفل هذه الصفحة. ننصحك بمراجعة هذه الصفحة بشكل دوري للبقاء على اطلاع بكيفية حمايتنا لبياناتك.
              </p>
            </section>

            <section className="space-y-4">
              <div className="flex items-center gap-3 text-primary">
                <Mail size={24} />
                <h2 className="text-2xl font-bold text-white">7. الاتصال بنا</h2>
              </div>
              <p className="text-[#A1A1AA] leading-relaxed text-lg mr-9">
                إذا كان لديك أي أسئلة أو استفسارات بشأن سياسة الخصوصية هذه، يمكنك التواصل مع إدارة منصة تيكي تاكا عبر البريد الإلكتروني الرسمي للموقع أو من خلال صفحة "تواصل معنا".
              </p>
            </section>

          </div>
        </div>
      </main>

      <TikiTakaFooter />
    </div>
  );
}
