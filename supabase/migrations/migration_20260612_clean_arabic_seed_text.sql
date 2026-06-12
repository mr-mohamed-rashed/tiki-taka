update public.site_settings set
  value_ar = case key
    when 'matchCenter' then 'مركز المباريات'
    when 'matchCenterSub' then 'نتائج مباشرة، مواعيد ونتائج'
    when 'apiWidget' then 'ودجت كأس العالم المباشر'
    when 'apiWidgetSub' then 'مدمج مباشرة من API-Football'
    when 'goldenBoot' then 'سباق الحذاء الذهبي'
    when 'goldenBootSub' then 'هدافو البطولة'
    when 'worldCupPulse' then 'نبض كأس العالم'
    when 'highlights' then 'الملخصات'
    when 'highlightsSub' then 'ملخصات المباريات وأبرز لقطات البطولة'
    else value_ar
  end
where key in (
  'matchCenter',
  'matchCenterSub',
  'apiWidget',
  'apiWidgetSub',
  'goldenBoot',
  'goldenBootSub',
  'worldCupPulse',
  'highlights',
  'highlightsSub'
);

update public.page_sections set
  name_ar = case section_key
    when 'hero' then 'البانر الرئيسي'
    when 'matchCenter' then 'مركز المباريات'
    when 'apiWidget' then 'الودجت المباشر'
    when 'goldenBoot' then 'سباق الحذاء الذهبي'
    when 'worldCupPulse' then 'نبض كأس العالم'
    when 'highlights' then 'الملخصات'
    when 'header' then 'رأس صفحة الأخبار'
    when 'newsgrid' then 'شبكة الأخبار'
    when 'liveSection' then 'المباريات المباشرة'
    else name_ar
  end,
  subtitle_ar = case section_key
    when 'hero' then 'عداد الافتتاح والأخبار المميزة'
    when 'matchCenter' then 'نتائج مباشرة، مواعيد ونتائج'
    when 'apiWidget' then 'ودجت مدمج من API-Football'
    when 'goldenBoot' then 'هدافو البطولة'
    when 'worldCupPulse' then 'آخر العناوين'
    when 'highlights' then 'ملخصات المباريات ومقاطع الفيديو'
    when 'header' then 'جامع أخبار كأس العالم 2026'
    when 'newsgrid' then 'شبكة بطاقات المقالات'
    when 'liveSection' then 'نتائج ومباريات في الوقت الحقيقي'
    else subtitle_ar
  end;
