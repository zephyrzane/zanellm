const THEME_STORAGE_KEY = 'zanellm_theme'
const THEME_MODE_STORAGE_KEY = 'zanellm_theme_mode'
const DEFAULT_THEME_SLUG = 'kuro'
const THEME_EVENT = 'zanellm-theme-change'

export type ThemeName = string
export type ThemeMode = 'light' | 'dark'

export interface NipponColor {
  slug: string
  label: string
  japanese: string
  hex: string
}

export interface ThemePreset {
  name: ThemeName
  label: string
  description: string
  color: NipponColor
  appearance: ThemeMode
  values: Record<string, string>
}

export const nipponColors: NipponColor[] = [
  { slug: 'nadeshiko', label: 'Nadeshiko', japanese: '撫子', hex: '#DC9FB4' },
  { slug: 'kohbai', label: 'Kohbai', japanese: '紅梅', hex: '#E16B8C' },
  { slug: 'suoh', label: 'Suoh', japanese: '蘇芳', hex: '#8E354A' },
  { slug: 'taikoh', label: 'Taikoh', japanese: '退紅', hex: '#F8C3CD' },
  { slug: 'ikkonzome', label: 'Ikkonzome', japanese: '一斥染', hex: '#F4A7B9' },
  { slug: 'kuwazome', label: 'Kuwazome', japanese: '桑染', hex: '#64363C' },
  { slug: 'momo', label: 'Momo', japanese: '桃', hex: '#F596AA' },
  { slug: 'ichigo', label: 'Ichigo', japanese: '苺', hex: '#B5495B' },
  { slug: 'usubeni', label: 'Usubeni', japanese: '薄紅', hex: '#E87A90' },
  { slug: 'imayoh', label: 'Imayoh', japanese: '今様', hex: '#D05A6E' },
  { slug: 'nakabeni', label: 'Nakabeni', japanese: '中紅', hex: '#DB4D6D' },
  { slug: 'sakura', label: 'Sakura', japanese: '桜', hex: '#FEDFE1' },
  { slug: 'umenezumi', label: 'Umenezumi', japanese: '梅鼠', hex: '#9E7A7A' },
  { slug: 'karakurenai', label: 'Karakurenai', japanese: '韓紅花', hex: '#D0104C' },
  { slug: 'enji', label: 'Enji', japanese: '燕脂', hex: '#9F353A' },
  { slug: 'kurenai', label: 'Kurenai', japanese: '紅', hex: '#CB1B45' },
  { slug: 'toki', label: 'Toki', japanese: '鴇', hex: '#EEA9A9' },
  { slug: 'cyohsyun', label: 'Cyohsyun', japanese: '長春', hex: '#BF6766' },
  { slug: 'kokiake', label: 'Kokiake', japanese: '深緋', hex: '#86473F' },
  { slug: 'sakuranezumi', label: 'Sakuranezumi', japanese: '桜鼠', hex: '#B19693' },
  { slug: 'jinzamomi', label: 'Jinzamomi', japanese: '甚三紅', hex: '#EB7A77' },
  { slug: 'azuki', label: 'Azuki', japanese: '小豆', hex: '#954A45' },
  { slug: 'suohkoh', label: 'Suohkoh', japanese: '蘇芳香', hex: '#A96360' },
  { slug: 'akabeni', label: 'Akabeni', japanese: '赤紅', hex: '#CB4042' },
  { slug: 'shinsyu', label: 'Shinsyu', japanese: '真朱', hex: '#AB3B3A' },
  { slug: 'haizakura', label: 'Haizakura', japanese: '灰桜', hex: '#D7C4BB' },
  { slug: 'kuriume', label: 'Kuriume', japanese: '栗梅', hex: '#904840' },
  { slug: 'ebicha', label: 'Ebicha', japanese: '海老茶', hex: '#734338' },
  { slug: 'ginsyu', label: 'Ginsyu', japanese: '銀朱', hex: '#C73E3A' },
  { slug: 'kurotobi', label: 'Kurotobi', japanese: '黒鳶', hex: '#554236' },
  { slug: 'benitobi', label: 'Benitobi', japanese: '紅鳶', hex: '#994639' },
  { slug: 'akebono', label: 'Akebono', japanese: '曙', hex: '#F19483' },
  { slug: 'benikaba', label: 'Benikaba', japanese: '紅樺', hex: '#B54434' },
  { slug: 'mizugaki', label: 'Mizugaki', japanese: '水がき', hex: '#B9887D' },
  { slug: 'sangosyu', label: 'Sangosyu', japanese: '珊瑚朱', hex: '#F17C67' },
  { slug: 'benihiwada', label: 'Benihiwada', japanese: '紅檜皮', hex: '#884C3A' },
  { slug: 'syojyohi', label: 'Syojyohi', japanese: '猩猩緋', hex: '#E83015' },
  { slug: 'entan', label: 'Entan', japanese: '鉛丹', hex: '#D75455' },
  { slug: 'shikancha', label: 'Shikancha', japanese: '芝翫茶', hex: '#B55D4C' },
  { slug: 'hiwada', label: 'Hiwada', japanese: '檜皮', hex: '#854836' },
  { slug: 'kakishibu', label: 'Kakishibu', japanese: '柿渋', hex: '#A35E47' },
  { slug: 'ake', label: 'Ake', japanese: '緋', hex: '#CC543A' },
  { slug: 'tobi', label: 'Tobi', japanese: '鳶', hex: '#724832' },
  { slug: 'benihi', label: 'Benihi', japanese: '紅緋', hex: '#F75C2F' },
  { slug: 'kurikawacha', label: 'Kurikawacha', japanese: '栗皮茶', hex: '#6A4028' },
  { slug: 'bengara', label: 'Bengara', japanese: '弁柄', hex: '#9A5034' },
  { slug: 'terigaki', label: 'Terigaki', japanese: '照柿', hex: '#C46243' },
  { slug: 'edocha', label: 'Edocha', japanese: '江戸茶', hex: '#AF5F3C' },
  { slug: 'araisyu', label: 'Araisyu', japanese: '洗朱', hex: '#FB966E' },
  { slug: 'momoshiocha', label: 'Momoshiocha', japanese: '百塩茶', hex: '#724938' },
  { slug: 'karacha', label: 'Karacha', japanese: '唐茶', hex: '#B47157' },
  { slug: 'tokigaracha', label: 'Tokigaracha', japanese: 'ときがら茶', hex: '#DB8E71' },
  { slug: 'ohni', label: 'Ohni', japanese: '黄丹', hex: '#F05E1C' },
  { slug: 'sohi', label: 'Sohi', japanese: '纁', hex: '#ED784A' },
  { slug: 'ensyucha', label: 'Ensyucha', japanese: '遠州茶', hex: '#CA7853' },
  { slug: 'kabacha', label: 'Kabacha', japanese: '樺茶', hex: '#B35C37' },
  { slug: 'kogecha', label: 'Kogecha', japanese: '焦茶', hex: '#563F2E' },
  { slug: 'akakoh', label: 'Akakoh', japanese: '赤香', hex: '#E3916E' },
  { slug: 'suzumecha', label: 'Suzumecha', japanese: '雀茶', hex: '#8F5A3C' },
  { slug: 'shishi', label: 'Shishi', japanese: '宍', hex: '#F0A986' },
  { slug: 'sodenkaracha', label: 'Sodenkaracha', japanese: '宗伝唐茶', hex: '#A0674B' },
  { slug: 'kaba', label: 'Kaba', japanese: '樺', hex: '#C1693C' },
  { slug: 'kokikuchinashi', label: 'Kokikuchinashi', japanese: '深支子', hex: '#FB9966' },
  { slug: 'kurumi', label: 'Kurumi', japanese: '胡桃', hex: '#947A6D' },
  { slug: 'taisya', label: 'Taisya', japanese: '代赭', hex: '#A36336' },
  { slug: 'araigaki', label: 'Araigaki', japanese: '洗柿', hex: '#E79460' },
  { slug: 'kohrozen', label: 'Kohrozen', japanese: '黄櫨染', hex: '#7D532C' },
  { slug: 'akakuchiba', label: 'Akakuchiba', japanese: '赤朽葉', hex: '#C78550' },
  { slug: 'tonocha', label: 'Tonocha', japanese: '礪茶', hex: '#985F2A' },
  { slug: 'akashirotsurubami', label: 'Akashirotsurubami', japanese: '赤白橡', hex: '#E1A679' },
  { slug: 'sencha', label: 'Sencha', japanese: '煎茶', hex: '#855B32' },
  { slug: 'kanzo', label: 'Kanzo', japanese: '萱草', hex: '#FC9F4D' },
  { slug: 'sharegaki', label: 'Sharegaki', japanese: '洒落柿', hex: '#FFBA84' },
  { slug: 'beniukon', label: 'Beniukon', japanese: '紅鬱金', hex: '#E98B2A' },
  { slug: 'umezome', label: 'Umezome', japanese: '梅染', hex: '#E9A368' },
  { slug: 'biwacha', label: 'Biwacha', japanese: '枇杷茶', hex: '#B17844' },
  { slug: 'chojicha', label: 'Chojicha', japanese: '丁子茶', hex: '#96632E' },
  { slug: 'kenpohzome', label: 'Kenpohzome', japanese: '憲法染', hex: '#43341B' },
  { slug: 'kohaku', label: 'Kohaku', japanese: '琥珀', hex: '#CA7A2C' },
  { slug: 'usugaki', label: 'Usugaki', japanese: '薄柿', hex: '#ECB88A' },
  { slug: 'kyara', label: 'Kyara', japanese: '伽羅', hex: '#78552B' },
  { slug: 'chojizome', label: 'Chojizome', japanese: '丁子染', hex: '#B07736' },
  { slug: 'fushizome', label: 'Fushizome', japanese: '柴染', hex: '#967249' },
  { slug: 'kuchiba', label: 'Kuchiba', japanese: '朽葉', hex: '#E2943B' },
  { slug: 'kincha', label: 'Kincha', japanese: '金茶', hex: '#C7802D' },
  { slug: 'kitsune', label: 'Kitsune', japanese: '狐', hex: '#9B6E23' },
  { slug: 'susutake', label: 'Susutake', japanese: '煤竹', hex: '#6E552F' },
  { slug: 'usukoh', label: 'Usukoh', japanese: '薄香', hex: '#EBB471' },
  { slug: 'tonoko', label: 'Tonoko', japanese: '砥粉', hex: '#D7B98E' },
  { slug: 'ginsusutake', label: 'Ginsusutake', japanese: '銀煤竹', hex: '#82663A' },
  { slug: 'ohdo', label: 'Ohdo', japanese: '黄土', hex: '#B68E55' },
  { slug: 'shiracha', label: 'Shiracha', japanese: '白茶', hex: '#BC9F77' },
  { slug: 'kobicha', label: 'Kobicha', japanese: '媚茶', hex: '#876633' },
  { slug: 'kigaracha', label: 'Kigaracha', japanese: '黄唐茶', hex: '#C18A26' },
  { slug: 'yamabuki', label: 'Yamabuki', japanese: '山吹', hex: '#FFB11B' },
  { slug: 'yamabukicha', label: 'Yamabukicha', japanese: '山吹茶', hex: '#D19826' },
  { slug: 'hajizome', label: 'Hajizome', japanese: '櫨染', hex: '#DDA52D' },
  { slug: 'kuwacha', label: 'Kuwacha', japanese: '桑茶', hex: '#C99833' },
  { slug: 'tamago', label: 'Tamago', japanese: '玉子', hex: '#F9BF45' },
  { slug: 'shirotsurubami', label: 'Shirotsurubami', japanese: '白橡', hex: '#DCB879' },
  { slug: 'kitsurubami', label: 'Kitsurubami', japanese: '黄橡', hex: '#BA9132' },
  { slug: 'tamamorokoshi', label: 'Tamamorokoshi', japanese: '玉蜀黍', hex: '#E8B647' },
  { slug: 'hanaba', label: 'Hanaba', japanese: '花葉', hex: '#F7C242' },
  { slug: 'namakabe', label: 'Namakabe', japanese: '生壁', hex: '#7D6C46' },
  { slug: 'torinoko', label: 'Torinoko', japanese: '鳥の子', hex: '#DAC9A6' },
  { slug: 'usuki', label: 'Usuki', japanese: '浅黄', hex: '#FAD689' },
  { slug: 'kikuchiba', label: 'Kikuchiba', japanese: '黄朽葉', hex: '#D9AB42' },
  { slug: 'kuchinashi', label: 'Kuchinashi', japanese: '梔子', hex: '#F6C555' },
  { slug: 'tohoh', label: 'Tohoh', japanese: '籐黄', hex: '#FFC408' },
  { slug: 'ukon', label: 'Ukon', japanese: '鬱金', hex: '#EFBB24' },
  { slug: 'karashi', label: 'Karashi', japanese: '芥子', hex: '#CAAD5F' },
  { slug: 'higosusutake', label: 'Higosusutake', japanese: '肥後煤竹', hex: '#8D742A' },
  { slug: 'rikyushiracha', label: 'Rikyushiracha', japanese: '利休白茶', hex: '#B4A582' },
  { slug: 'aku', label: 'Aku', japanese: '灰汁', hex: '#877F6C' },
  { slug: 'rikyucha', label: 'Rikyucha', japanese: '利休茶', hex: '#897D55' },
  { slug: 'rokohcha', label: 'Rokohcha', japanese: '路考茶', hex: '#74673E' },
  { slug: 'nataneyu', label: 'Nataneyu', japanese: '菜種油', hex: '#A28C37' },
  { slug: 'uguisucha', label: 'Uguisucha', japanese: '鶯茶', hex: '#6C6024' },
  { slug: 'kimirucha', label: 'Kimirucha', japanese: '黄海松茶', hex: '#867835' },
  { slug: 'mirucha', label: 'Mirucha', japanese: '海松茶', hex: '#62592C' },
  { slug: 'kariyasu', label: 'Kariyasu', japanese: '刈安', hex: '#E9CD4C' },
  { slug: 'nanohana', label: 'Nanohana', japanese: '菜の花', hex: '#F7D94C' },
  { slug: 'kihada', label: 'Kihada', japanese: '黄蘗', hex: '#FBE251' },
  { slug: 'mushikuri', label: 'Mushikuri', japanese: '蒸栗', hex: '#D9CD90' },
  { slug: 'aokuchiba', label: 'Aokuchiba', japanese: '青朽葉', hex: '#ADA142' },
  { slug: 'ominaeshi', label: 'Ominaeshi', japanese: '女郎花', hex: '#DDD23B' },
  { slug: 'hiwacha', label: 'Hiwacha', japanese: '鶸茶', hex: '#A5A051' },
  { slug: 'hiwa', label: 'Hiwa', japanese: '鶸', hex: '#BEC23F' },
  { slug: 'uguisu', label: 'Uguisu', japanese: '鶯', hex: '#6C6A2D' },
  { slug: 'yanagicha', label: 'Yanagicha', japanese: '柳茶', hex: '#939650' },
  { slug: 'koke', label: 'Koke', japanese: '苔', hex: '#838A2D' },
  { slug: 'kikujin', label: 'Kikujin', japanese: '麹塵', hex: '#B1B479' },
  { slug: 'rikancha', label: 'Rikancha', japanese: '璃寛茶', hex: '#616138' },
  { slug: 'aikobicha', label: 'Aikobicha', japanese: '藍媚茶', hex: '#4B4E2A' },
  { slug: 'miru', label: 'Miru', japanese: '海松', hex: '#5B622E' },
  { slug: 'sensaicha', label: 'Sensaicha', japanese: '千歳茶', hex: '#4D5139' },
  { slug: 'baikocha', label: 'Baikocha', japanese: '梅幸茶', hex: '#89916B' },
  { slug: 'hiwamoegi', label: 'Hiwamoegi', japanese: '鶸萌黄', hex: '#90B44B' },
  { slug: 'yanagizome', label: 'Yanagizome', japanese: '柳染', hex: '#91AD70' },
  { slug: 'urayanagi', label: 'Urayanagi', japanese: '裏柳', hex: '#B5CAA0' },
  { slug: 'iwaicha', label: 'Iwaicha', japanese: '岩井茶', hex: '#646A58' },
  { slug: 'moegi', label: 'Moegi', japanese: '萌黄', hex: '#7BA23F' },
  { slug: 'nae', label: 'Nae', japanese: '苗', hex: '#86C166' },
  { slug: 'yanagisusutake', label: 'Yanagisusutake', japanese: '柳煤竹', hex: '#4A593D' },
  { slug: 'matsuba', label: 'Matsuba', japanese: '松葉', hex: '#42602D' },
  { slug: 'aoni', label: 'Aoni', japanese: '青丹', hex: '#516E41' },
  { slug: 'usuao', label: 'Usuao', japanese: '薄青', hex: '#91B493' },
  { slug: 'yanaginezumi', label: 'Yanaginezumi', japanese: '柳鼠', hex: '#808F7C' },
  { slug: 'tokiwa', label: 'Tokiwa', japanese: '常磐', hex: '#1B813E' },
  { slug: 'wakatake', label: 'Wakatake', japanese: '若竹', hex: '#5DAC81' },
  { slug: 'chitosemidori', label: 'Chitosemidori', japanese: '千歳緑', hex: '#36563C' },
  { slug: 'midori', label: 'Midori', japanese: '緑', hex: '#227D51' },
  { slug: 'byakuroku', label: 'Byakuroku', japanese: '白緑', hex: '#A8D8B9' },
  { slug: 'oitake', label: 'Oitake', japanese: '老竹', hex: '#6A8372' },
  { slug: 'tokusa', label: 'Tokusa', japanese: '木賊', hex: '#2D6D4B' },
  { slug: 'onandocha', label: 'Onandocha', japanese: '御納戸茶', hex: '#465D4C' },
  { slug: 'rokusyoh', label: 'Rokusyoh', japanese: '緑青', hex: '#24936E' },
  { slug: 'sabiseiji', label: 'Sabiseiji', japanese: '錆青磁', hex: '#86A697' },
  { slug: 'aotake', label: 'Aotake', japanese: '青竹', hex: '#00896C' },
  { slug: 'veludo', label: 'Veludo', japanese: 'ビロード', hex: '#096148' },
  { slug: 'mushiao', label: 'Mushiao', japanese: '虫襖', hex: '#20604F' },
  { slug: 'aimirucha', label: 'Aimirucha', japanese: '藍海松茶', hex: '#0F4C3A' },
  { slug: 'tonocha2', label: 'Tonocha2', japanese: '沈香茶', hex: '#4F726C' },
  { slug: 'aomidori', label: 'Aomidori', japanese: '青緑', hex: '#00AA90' },
  { slug: 'seiji', label: 'Seiji', japanese: '青磁', hex: '#69B0AC' },
  { slug: 'tetsu', label: 'Tetsu', japanese: '鉄', hex: '#26453D' },
  { slug: 'mizuasagi', label: 'Mizuasagi', japanese: '水浅葱', hex: '#66BAB7' },
  { slug: 'seiheki', label: 'Seiheki', japanese: '青碧', hex: '#268785' },
  { slug: 'sabitetsuonando', label: 'Sabitetsuonando', japanese: '錆鉄御納戸', hex: '#405B55' },
  { slug: 'korainando', label: 'Korainando', japanese: '高麗納戸', hex: '#305A56' },
  { slug: 'byakugun', label: 'Byakugun', japanese: '白群', hex: '#78C2C4' },
  { slug: 'omeshicha', label: 'Omeshicha', japanese: '御召茶', hex: '#376B6D' },
  { slug: 'kamenozoki', label: 'Kamenozoki', japanese: '瓶覗', hex: '#A5DEE4' },
  { slug: 'fukagawanezumi', label: 'Fukagawanezumi', japanese: '深川鼠', hex: '#77969A' },
  { slug: 'sabiasagi', label: 'Sabiasagi', japanese: '錆浅葱', hex: '#6699A1' },
  { slug: 'mizu', label: 'Mizu', japanese: '水', hex: '#81C7D4' },
  { slug: 'asagi', label: 'Asagi', japanese: '浅葱', hex: '#33A6B8' },
  { slug: 'onando', label: 'Onando', japanese: '御納戸', hex: '#0C4842' },
  { slug: 'ai', label: 'Ai', japanese: '藍', hex: '#0D5661' },
  { slug: 'shinbashi', label: 'Shinbashi', japanese: '新橋', hex: '#0089A7' },
  { slug: 'sabionando', label: 'Sabionando', japanese: '錆御納戸', hex: '#336774' },
  { slug: 'tetsuonando', label: 'Tetsuonando', japanese: '鉄御納戸', hex: '#255359' },
  { slug: 'hanaasagi', label: 'Hanaasagi', japanese: '花浅葱', hex: '#1E88A8' },
  { slug: 'ainezumi', label: 'Ainezumi', japanese: '藍鼠', hex: '#566C73' },
  { slug: 'masuhana', label: 'Masuhana', japanese: '舛花', hex: '#577C8A' },
  { slug: 'sora', label: 'Sora', japanese: '空', hex: '#58B2DC' },
  { slug: 'noshimehana', label: 'Noshimehana', japanese: '熨斗目花', hex: '#2B5F75' },
  { slug: 'chigusa', label: 'Chigusa', japanese: '千草', hex: '#3A8FB7' },
  { slug: 'omeshionando', label: 'Omeshionando', japanese: '御召御納戸', hex: '#2E5C6E' },
  { slug: 'hanada', label: 'Hanada', japanese: '縹', hex: '#006284' },
  { slug: 'wasurenagusa', label: 'Wasurenagusa', japanese: '勿忘草', hex: '#7DB9DE' },
  { slug: 'gunjyo', label: 'Gunjyo', japanese: '群青', hex: '#51A8DD' },
  { slug: 'tsuyukusa', label: 'Tsuyukusa', japanese: '露草', hex: '#2EA9DF' },
  { slug: 'kurotsurubami', label: 'Kurotsurubami', japanese: '黒橡', hex: '#0B1013' },
  { slug: 'kon', label: 'Kon', japanese: '紺', hex: '#0F2540' },
  { slug: 'kachi', label: 'Kachi', japanese: '褐', hex: '#08192D' },
  { slug: 'ruri', label: 'Ruri', japanese: '瑠璃', hex: '#005CAF' },
  { slug: 'rurikon', label: 'Rurikon', japanese: '瑠璃紺', hex: '#0B346E' },
  { slug: 'benimidori', label: 'Benimidori', japanese: '紅碧', hex: '#7B90D2' },
  { slug: 'fujinezumi', label: 'Fujinezumi', japanese: '藤鼠', hex: '#6E75A4' },
  { slug: 'tetsukon', label: 'Tetsukon', japanese: '鉄紺', hex: '#261E47' },
  { slug: 'konjyo', label: 'Konjyo', japanese: '紺青', hex: '#113285' },
  { slug: 'benikakehana', label: 'Benikakehana', japanese: '紅掛花', hex: '#4E4F97' },
  { slug: 'konkikyo', label: 'Konkikyo', japanese: '紺桔梗', hex: '#211E55' },
  { slug: 'fuji', label: 'Fuji', japanese: '藤', hex: '#8B81C3' },
  { slug: 'futaai', label: 'Futaai', japanese: '二藍', hex: '#70649A' },
  { slug: 'ouchi', label: 'Ouchi', japanese: '楝', hex: '#9B90C2' },
  { slug: 'fujimurasaki', label: 'Fujimurasaki', japanese: '藤紫', hex: '#8A6BBE' },
  { slug: 'kikyo', label: 'Kikyo', japanese: '桔梗', hex: '#6A4C9C' },
  { slug: 'shion', label: 'Shion', japanese: '紫苑', hex: '#8F77B5' },
  { slug: 'messhi', label: 'Messhi', japanese: '滅紫', hex: '#533D5B' },
  { slug: 'usu', label: 'Usu', japanese: '薄', hex: '#B28FCE' },
  { slug: 'hashita', label: 'Hashita', japanese: '半', hex: '#986DB2' },
  { slug: 'edomurasaki', label: 'Edomurasaki', japanese: '江戸紫', hex: '#77428D' },
  { slug: 'shikon', label: 'Shikon', japanese: '紫紺', hex: '#3C2F41' },
  { slug: 'kokimurasaki', label: 'Kokimurasaki', japanese: '深紫', hex: '#4A225D' },
  { slug: 'sumire', label: 'Sumire', japanese: '菫', hex: '#66327C' },
  { slug: 'murasaki', label: 'Murasaki', japanese: '紫', hex: '#592C63' },
  { slug: 'ayame', label: 'Ayame', japanese: '菖蒲', hex: '#6F3381' },
  { slug: 'fujisusutake', label: 'Fujisusutake', japanese: '藤煤竹', hex: '#574C57' },
  { slug: 'benifuji', label: 'Benifuji', japanese: '紅藤', hex: '#B481BB' },
  { slug: 'kurobeni', label: 'Kurobeni', japanese: '黒紅', hex: '#3F2B36' },
  { slug: 'nasukon', label: 'Nasukon', japanese: '茄子紺', hex: '#572A3F' },
  { slug: 'budohnezumi', label: 'Budohnezumi', japanese: '葡萄鼠', hex: '#5E3D50' },
  { slug: 'hatobanezumi', label: 'Hatobanezumi', japanese: '鳩羽鼠', hex: '#72636E' },
  { slug: 'kakitsubata', label: 'Kakitsubata', japanese: '杜若', hex: '#622954' },
  { slug: 'ebizome', label: 'Ebizome', japanese: '蒲葡', hex: '#6D2E5B' },
  { slug: 'botan', label: 'Botan', japanese: '牡丹', hex: '#C1328E' },
  { slug: 'umemurasaki', label: 'Umemurasaki', japanese: '梅紫', hex: '#A8497A' },
  { slug: 'nisemurasaki', label: 'Nisemurasaki', japanese: '似紫', hex: '#562E37' },
  { slug: 'tsutsuji', label: 'Tsutsuji', japanese: '躑躅', hex: '#E03C8A' },
  { slug: 'murasakitobi', label: 'Murasakitobi', japanese: '紫鳶', hex: '#60373E' },
  { slug: 'shironeri', label: 'Shironeri', japanese: '白練', hex: '#FCFAF2' },
  { slug: 'gofun', label: 'Gofun', japanese: '胡粉', hex: '#FFFFFB' },
  { slug: 'shironezumi', label: 'Shironezumi', japanese: '白鼠', hex: '#BDC0BA' },
  { slug: 'ginnezumi', label: 'Ginnezumi', japanese: '銀鼠', hex: '#91989F' },
  { slug: 'namari', label: 'Namari', japanese: '鉛', hex: '#787878' },
  { slug: 'hai', label: 'Hai', japanese: '灰', hex: '#828282' },
  { slug: 'sunezumi', label: 'Sunezumi', japanese: '素鼠', hex: '#787D7B' },
  { slug: 'rikyunezumi', label: 'Rikyunezumi', japanese: '利休鼠', hex: '#707C74' },
  { slug: 'nibi', label: 'Nibi', japanese: '鈍', hex: '#656765' },
  { slug: 'aonibi', label: 'Aonibi', japanese: '青鈍', hex: '#535953' },
  { slug: 'dobunezumi', label: 'Dobunezumi', japanese: '溝鼠', hex: '#4F4F48' },
  { slug: 'benikeshinezumi', label: 'Benikeshinezumi', japanese: '紅消鼠', hex: '#52433D' },
  { slug: 'aisumicha', label: 'Aisumicha', japanese: '藍墨茶', hex: '#373C38' },
  { slug: 'binrojizome', label: 'Binrojizome', japanese: '檳榔子染', hex: '#3A3226' },
  { slug: 'keshizumi', label: 'Keshizumi', japanese: '消炭', hex: '#434343' },
  { slug: 'sumi', label: 'Sumi', japanese: '墨', hex: '#1C1C1C' },
  { slug: 'kuro', label: 'Kuro', japanese: '黒', hex: '#080808' },
  { slug: 'ro', label: 'Ro', japanese: '呂', hex: '#0C0C0C' },
]

function hexToRgb(hex: string): [number, number, number] {
  const normalized = hex.replace('#', '')
  return [
    parseInt(normalized.slice(0, 2), 16),
    parseInt(normalized.slice(2, 4), 16),
    parseInt(normalized.slice(4, 6), 16),
  ]
}

function rgbDistance(a: [number, number, number], b: [number, number, number]): number {
  const [ar, ag, ab] = a
  const [br, bg, bb] = b
  return (ar - br) ** 2 + (ag - bg) ** 2 + (ab - bb) ** 2
}

export function nearestNipponColor(hex: string): NipponColor {
  const target = hexToRgb(hex)
  return nipponColors.reduce((best, color) => {
    const distance = rgbDistance(target, hexToRgb(color.hex))
    if (distance < best.distance) return { color, distance }
    return best
  }, { color: nipponColors[0], distance: Number.POSITIVE_INFINITY }).color
}

function mix(hex: string, target: '#000000' | '#ffffff', amount: number): string {
  const [r, g, b] = hexToRgb(hex)
  const [tr, tg, tb] = hexToRgb(target)
  const next = [r, g, b].map((value, index) => {
    const t = [tr, tg, tb][index]
    return Math.round(value + (t - value) * amount)
  })
  return `#${next.map((value) => value.toString(16).padStart(2, '0')).join('')}`
}

function themeFromNipponColor(color: NipponColor, appearance: ThemeMode): ThemePreset {
  const dark = appearance === 'dark'
  const base = color.hex
  const values = dark
    ? {
        '--color-bg-primary': mix(base, '#000000', 0.88),
        '--color-bg-secondary': mix(base, '#000000', 0.8),
        '--color-bg-tertiary': mix(base, '#000000', 0.64),
        '--color-text-primary': '#f7f7f3',
        '--color-text-secondary': mix(base, '#ffffff', 0.72),
        '--color-text-tertiary': mix(base, '#ffffff', 0.48),
        '--color-accent': mix(base, '#ffffff', 0.82),
        '--color-accent-glow': 'rgba(255, 255, 255, 0.18)',
      }
    : {
        '--color-bg-primary': mix(base, '#ffffff', 0.88),
        '--color-bg-secondary': mix(base, '#ffffff', 0.95),
        '--color-bg-tertiary': mix(base, '#ffffff', 0.72),
        '--color-text-primary': '#171717',
        '--color-text-secondary': mix(base, '#000000', 0.62),
        '--color-text-tertiary': mix(base, '#000000', 0.42),
        '--color-accent': mix(base, '#000000', 0.72),
        '--color-accent-glow': 'rgba(0, 0, 0, 0.12)',
      }

  return {
    name: `${color.slug}-${appearance}`,
    label: color.label,
    description: `${color.japanese} / ${color.hex}`,
    color,
    appearance,
    values,
  }
}

export const themePresets: ThemePreset[] = nipponColors.flatMap((color) => [
  themeFromNipponColor(color, 'dark'),
  themeFromNipponColor(color, 'light'),
])

export function themeNameForColor(slug: string, mode: ThemeMode): ThemeName {
  return `${slug}-${mode}`
}

export function colorSlugFromTheme(name: string | null): string {
  return getTheme(name).color.slug
}

export function getTheme(name: string | null): ThemePreset {
  return (
    themePresets.find((theme) => theme.name === name) ??
    themePresets.find((theme) => theme.name === themeNameForColor(DEFAULT_THEME_SLUG, 'dark')) ??
    themePresets[0]
  )
}

export function applyTheme(name: ThemeName) {
  const root = document.documentElement
  const theme = getTheme(name)

  for (const [property, value] of Object.entries(theme.values)) {
    root.style.setProperty(property, value)
  }
}

export function getStoredThemeMode(): ThemeMode {
  if (typeof window !== 'undefined' && window.matchMedia?.('(prefers-color-scheme: light)').matches) {
    return 'light'
  }
  return 'dark'
}

function resolveThemeName(name: ThemeName, mode: ThemeMode): ThemeName {
  return themeNameForColor(colorSlugFromTheme(name), mode)
}

export function applyStoredTheme() {
  applyTheme(resolveThemeName(getStoredTheme(), getStoredThemeMode()))
}

export function getStoredTheme(): ThemeName {
  return getTheme(localStorage.getItem(THEME_STORAGE_KEY)).name
}

export function saveTheme(name: ThemeName) {
  localStorage.setItem(THEME_STORAGE_KEY, name)
  applyStoredTheme()
  window.dispatchEvent(new Event(THEME_EVENT))
}

export function saveThemeMode(mode: ThemeMode) {
  localStorage.setItem(THEME_MODE_STORAGE_KEY, mode)
  const nextTheme = resolveThemeName(getStoredTheme(), mode)
  localStorage.setItem(THEME_STORAGE_KEY, nextTheme)
  applyStoredTheme()
  window.dispatchEvent(new Event(THEME_EVENT))
}

export function subscribeThemeChanges(callback: () => void) {
  const handleStorage = (event: StorageEvent) => {
    if (event.key === THEME_STORAGE_KEY || event.key === THEME_MODE_STORAGE_KEY) callback()
  }
  window.addEventListener(THEME_EVENT, callback)
  window.addEventListener('storage', handleStorage)
  return () => {
    window.removeEventListener(THEME_EVENT, callback)
    window.removeEventListener('storage', handleStorage)
  }
}
