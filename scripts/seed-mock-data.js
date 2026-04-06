const { PrismaClient, ExperienceCategory } = require('@prisma/client');

const prisma = new PrismaClient();

const mockRecords = [
  {
    senior: {
      name: '王昊然',
      school: '清华大学',
      major: '金融工程',
      graduationYear: 2024,
      destination: '中金公司投资银行部',
      direction: '投行实习',
      intro:
        '本科期间主攻财务建模与并购估值，先后在券商行研和投行实习，最终拿到中金投行 return offer。',
    },
    entry: {
      title: '中金投行暑期实习：8周拿到 return offer',
      category: ExperienceCategory.INTERNSHIP,
      content:
        '我在大三暑期进入中金投行部，前两周把行业资料和历史项目模板全部过了一遍，建立自己的估值和路演材料模板库。第3-6周跟了两个 IPO 项目，核心是财务三表勾稽、可比公司筛选、估值敏感性分析和招股书数据核对。第7周主动补位做了管理层路演 Q&A 备忘，第8周参与了项目内部复盘。关键经验是：每天固定 30 分钟复盘错误，和同组 mentor 对齐优先级，保证交付准确率和响应速度。',
      applicableTo: '目标中金/中信/高盛投行暑期实习的金融或经管学生',
      outcome: '获得中金投行部 return offer，后续秋招免去多轮面试',
      sourceNote: '模拟案例：2024 暑期投行实习复盘',
      tags: ['中金', '投行', '财务建模', 'IPO', '实习转正'],
    },
  },
  {
    senior: {
      name: '刘晨曦',
      school: '北京大学',
      major: '数学与应用数学',
      graduationYear: 2025,
      destination: 'UC Berkeley EECS 直博',
      direction: '海外直博',
      intro:
        '本科阶段聚焦优化与机器学习理论，连续两年参与科研项目，最终拿到 Berkeley EECS 直博录取。',
    },
    entry: {
      title: 'Berkeley EECS 直博申请：科研主线与推荐信策略',
      category: ExperienceCategory.RESEARCH,
      content:
        '我把申请准备拆成两条线：科研产出线和推荐信可信度线。科研上坚持一个主方向（优化+ML），在同一主题连续做两个项目，保证叙事完整；推荐信上优先选择能具体描述贡献的导师，而不是只看头衔。时间线上，我在申请前 12 个月完成论文初稿，前 6 个月完成套磁与文书框架，前 2 个月集中打磨 SoP。核心经验是用一条清晰问题链连接所有经历，让招生委员会快速判断你是“可持续做研究的人”。',
      applicableTo: '目标申请美国 CS/EECS 直博、已有科研基础的本科生',
      outcome: '获得 UC Berkeley EECS PhD 录取，并拿到全额奖学金',
      sourceNote: '模拟案例：2025 Fall 直博申请',
      tags: ['Berkeley', '直博', '科研', '推荐信', '套磁'],
    },
  },
  {
    senior: {
      name: '陈思远',
      school: '上海交通大学',
      major: '软件工程',
      graduationYear: 2023,
      destination: '字节跳动 推荐算法工程师',
      direction: '互联网求职',
      intro: '从后端开发转向推荐算法，秋招主攻大厂算法岗位，最终入职字节跳动商业化团队。',
    },
    entry: {
      title: '字节算法岗秋招：项目讲法决定面试上限',
      category: ExperienceCategory.JOB_HUNT,
      content:
        '秋招时我准备了两个项目：CTR 预估和召回优化。技术细节之外，我重点练“业务目标-技术方案-线上指标-复盘迭代”四段式讲法。每次面试都量化收益，比如 AUC 提升、线上点击率变化和延迟控制。算法题保持每日 2 题，系统设计每周复盘一次。拿到 offer 的关键不是刷题数量，而是让面试官看到你能把模型改进落到真实业务指标。',
      applicableTo: '目标字节/快手/腾讯等推荐算法岗位的学生',
      outcome: '拿到字节、快手两家 SSP offer，最终选择字节',
      sourceNote: '模拟案例：2023 秋招算法岗',
      tags: ['字节跳动', '推荐算法', '秋招', 'AUC', '系统设计'],
    },
  },
  {
    senior: {
      name: '李沐阳',
      school: '复旦大学',
      major: '金融学',
      graduationYear: 2024,
      destination: '中金公司研究部',
      direction: '券商行研',
      intro: '大二起进入行业研究赛道，靠深度行业框架和高质量周报拿到中金研究部实习机会。',
    },
    entry: {
      title: '中金行研实习：用周报体系打出辨识度',
      category: ExperienceCategory.INTERNSHIP,
      content:
        '行研实习最关键是“持续输出稳定质量”。我每周固定产出：行业动态 1 页、公司跟踪 2 页、估值变化 1 页。为了减少返工，我把常见图表和估值假设做成模板库，保证格式和逻辑一致。和导师沟通时先讲结论，再讲假设，再讲风险。最终导师给我的反馈是“可独立承担轻量覆盖任务”，这直接提升了留用概率。',
      applicableTo: '目标券商行研、基金研究岗的经管类学生',
      outcome: '获得中金研究部实习留用推荐，秋招直通终面',
      sourceNote: '模拟案例：卖方行研实习周报方法',
      tags: ['中金', '行研', '周报', '估值', '留用'],
    },
  },
  {
    senior: {
      name: '赵雨彤',
      school: '浙江大学',
      major: '计算机科学与技术',
      graduationYear: 2022,
      destination: '腾讯 WXG 后端工程师',
      direction: '互联网求职',
      intro: '主攻分布式系统和高并发服务，毕业后入职腾讯 WXG，负责消息中台能力建设。',
    },
    entry: {
      title: '腾讯后端岗求职：项目要体现复杂度与稳定性',
      category: ExperienceCategory.JOB_HUNT,
      content:
        '我在简历里只保留两个后端项目，但每个都写清楚了并发规模、瓶颈定位和优化结果。面试准备重点是 MySQL 索引、Redis 一致性、消息队列削峰和故障演练。二面时我重点讲了一次线上延迟告警排查路径：监控拆解、线程池观察、依赖服务降级。面试官更关心你如何在压力下做正确取舍，而不是只背八股。',
      applicableTo: '目标腾讯/阿里/美团后端开发岗位',
      outcome: '拿到腾讯 WXG 与美团基础研发 offer',
      sourceNote: '模拟案例：大厂后端面试复盘',
      tags: ['腾讯', '后端', '高并发', 'Redis', '消息队列'],
    },
  },
  {
    senior: {
      name: '周泽宇',
      school: '南京大学',
      major: '人工智能',
      graduationYear: 2023,
      destination: '阿里云 机器学习平台工程师',
      direction: 'AI 工程',
      intro: '从算法竞赛转向 MLOps，毕业后进入阿里云平台团队，负责训练与部署流水线。',
    },
    entry: {
      title: '阿里云 AI 工程岗：从模型到平台的能力迁移',
      category: ExperienceCategory.CAREER_PLANNING,
      content:
        '很多同学只准备模型训练，却忽视工程落地。我在校内项目里补齐了数据版本管理、模型部署和监控告警能力。面试时强调的是“让模型可持续运行”的体系化能力，而不只是离线指标。建议尽早接触容器化、CI/CD 和特征平台概念，这些在 AI 工程岗里比单点算法技巧更有区分度。',
      applicableTo: '目标 AI 工程、MLOps、平台化岗位的学生',
      outcome: '通过阿里云核心部门三轮技术面并拿到正式 offer',
      sourceNote: '模拟案例：AI 工程岗位能力迁移',
      tags: ['阿里云', 'MLOps', '平台工程', '部署', '职业规划'],
    },
  },
  {
    senior: {
      name: '徐可欣',
      school: '武汉大学',
      major: '电子信息工程',
      graduationYear: 2025,
      destination: '清华大学电子系（推免）',
      direction: '保研',
      intro: '绩点与竞赛并行，提前布局夏令营材料，最终成功推免至清华电子系。',
    },
    entry: {
      title: '保研时间线：从大二下开始准备最稳妥',
      category: ExperienceCategory.GRADUATE_RECOMMENDATION,
      content:
        '保研准备建议按季度推进：大二下确定方向并补核心课，大三上准备科研/竞赛成果，大三下完成夏令营投递。材料中最重要的是“能力证据链”，不要只罗列奖项。每一条经历都要回答：你解决了什么问题、用了什么方法、结果如何。面试阶段多做英文自我介绍和专业问答演练，可以显著提升稳定性。',
      applicableTo: '目标 985/顶尖院系推免的理工科同学',
      outcome: '入围 4 个夏令营，最终推免清华电子系',
      sourceNote: '模拟案例：电子信息方向保研复盘',
      tags: ['保研', '推免', '夏令营', '时间线', '电子信息'],
    },
  },
  {
    senior: {
      name: '黄子墨',
      school: '同济大学',
      major: '土木工程',
      graduationYear: 2021,
      destination: '美团 到店事业群产品经理',
      direction: '转行产品',
      intro: '非科班转产品，通过实习和作品集完成赛道切换，现负责商家增长方向。',
    },
    entry: {
      title: '跨专业转产品：先拿实习再冲校招',
      category: ExperienceCategory.CAREER_PLANNING,
      content:
        '我转产品分两步：第一步拿到中小厂 PM 实习验证岗位匹配度，第二步基于真实项目成果冲大厂。面试时重点讲“问题定义-用户研究-方案权衡-指标复盘”，而不是原型图细节。建议跨专业同学先建立一个可量化的案例池，比如转化率提升、留存提升、流程效率优化，能明显提高可信度。',
      applicableTo: '跨专业转产品、目标互联网 PM 的同学',
      outcome: '拿到美团与携程产品岗 offer，最终选择美团',
      sourceNote: '模拟案例：土木转产品求职路径',
      tags: ['转行', '产品经理', '美团', '案例复盘', '校招'],
    },
  },
  {
    senior: {
      name: '罗安琪',
      school: '华中科技大学',
      major: '自动化',
      graduationYear: 2024,
      destination: '字节跳动 商业化产品实习',
      direction: '产品实习',
      intro: '关注 AI 产品方向，通过数据分析和 AB 实验能力拿到字节商业化 PM 实习。',
    },
    entry: {
      title: '字节 PM 实习：AB 实验思维是加分项',
      category: ExperienceCategory.INTERNSHIP,
      content:
        '面试中我把一个校园项目拆成了完整实验闭环：假设提出、样本划分、指标选择、结果解释和后续迭代。产品岗不只看想法，更看你是否能用数据验证决策。建议准备 2-3 个“从问题到结果”的完整案例，并能解释为什么放弃某些方案。这个能力在字节产品面里非常关键。',
      applicableTo: '目标字节/快手等产品实习岗位的学生',
      outcome: '拿到字节商业化 PM 实习，转正评估评级 A',
      sourceNote: '模拟案例：商业化产品实习复盘',
      tags: ['字节跳动', '产品实习', 'AB实验', '数据分析', '商业化'],
    },
  },
  {
    senior: {
      name: '韩知远',
      school: '西安交通大学',
      major: '计算机科学与技术',
      graduationYear: 2022,
      destination: '百度 搜索架构工程师',
      direction: '后端研发',
      intro: '专注系统与网络方向，毕业后进入百度搜索架构团队，负责召回链路性能优化。',
    },
    entry: {
      title: '后端校招：把系统设计题练到可落地',
      category: ExperienceCategory.JOB_HUNT,
      content:
        '系统设计面试里，我不追求“最复杂方案”，而是先给可上线的基线方案，再逐步扩展一致性、高可用和成本权衡。每次回答都覆盖容量估算、瓶颈点、监控报警和故障恢复。建议大家把常见题型（短链、消息系统、搜索建议）练成模板，再结合实际项目经验讲权衡，效果最好。',
      applicableTo: '后端/基础架构校招同学',
      outcome: '拿到百度、京东基础架构岗位 offer',
      sourceNote: '模拟案例：后端系统设计面试',
      tags: ['百度', '后端', '系统设计', '高可用', '校招'],
    },
  },
  {
    senior: {
      name: '潘若溪',
      school: '中山大学',
      major: '生物信息学',
      graduationYear: 2024,
      destination: '牛津大学 计算生物学硕士',
      direction: '海外升学',
      intro: '通过跨学科项目把生物背景和编程能力结合，申请到英国顶尖计算生物项目。',
    },
    entry: {
      title: '跨学科申请：用项目证明你的可迁移能力',
      category: ExperienceCategory.RESEARCH,
      content:
        '我申请时重点强调“问题抽象能力”和“方法迁移能力”。一个核心项目是利用机器学习做基因表达分类，论文虽未正式发表，但有完整实验设计和复现实验。文书里要写清楚你为什么适合跨学科，以及你将如何在目标方向继续积累。只讲兴趣不讲证据，很难打动招生官。',
      applicableTo: '生物/化学/医学背景转计算方向的申请者',
      outcome: '获得牛津与帝国理工相关项目录取',
      sourceNote: '模拟案例：生物转计算升学',
      tags: ['跨学科', '牛津', '生物信息', '机器学习', '科研叙事'],
    },
  },
  {
    senior: {
      name: '冯启航',
      school: '华南理工大学',
      major: '电子科学与技术',
      graduationYear: 2021,
      destination: '华为 2012 实验室',
      direction: '科研工程',
      intro: '在信号处理和嵌入式系统方向长期积累，入职华为 2012 实验室参与通信算法研发。',
    },
    entry: {
      title: '科研工程岗：论文能力与工程能力要并重',
      category: ExperienceCategory.RESEARCH,
      content:
        '科研工程岗和纯学术不同，要求你既能理解论文，又能把算法落到工程系统里。我的准备方式是每周读 2 篇核心论文，同时做一个可运行 demo。面试时重点讲了算法从理论到工程化遇到的约束，例如算力、时延和精度权衡。建议提前熟悉 C++ 性能优化与实验设计。',
      applicableTo: '目标华为/中兴/研究院科研工程岗位',
      outcome: '通过华为 2012 实验室技术评审并入职',
      sourceNote: '模拟案例：通信算法科研工程求职',
      tags: ['华为', '科研工程', '通信算法', '论文复现', 'C++'],
    },
  },
  {
    senior: {
      name: '彭雅婷',
      school: '北京航空航天大学',
      major: '人工智能',
      graduationYear: 2025,
      destination: '北京大学智能学院（推免）',
      direction: '保研',
      intro: '以竞赛+科研双线推进，保研阶段重点展示长期研究潜力与团队协作能力。',
    },
    entry: {
      title: 'AI 方向保研：竞赛奖项要转化为科研能力',
      category: ExperienceCategory.GRADUATE_RECOMMENDATION,
      content:
        '很多同学在面试只讲比赛排名，但老师更关心你是否理解方法边界。我会把竞赛经历转成科研语言：问题定义、模型选择、实验对照、失败分析。材料准备时，把代码仓库和技术报告打磨成可复查状态，能显著增强可信度。最终答辩时，清楚表达“下一步想研究什么”非常重要。',
      applicableTo: '计划保研 AI/CS 方向的同学',
      outcome: '获得北大、上交两所院校预推免优秀营员',
      sourceNote: '模拟案例：AI 保研准备',
      tags: ['保研', 'AI', '竞赛', '科研', '预推免'],
    },
  },
  {
    senior: {
      name: '马骁然',
      school: '中国人民大学',
      major: '财政学',
      graduationYear: 2024,
      destination: '中金 固收研究实习',
      direction: '金融实习',
      intro: '长期关注宏观与利率债研究，通过高质量日报与周度策略拿到中金固收实习机会。',
    },
    entry: {
      title: '中金固收实习：宏观框架与数据敏感度并重',
      category: ExperienceCategory.INTERNSHIP,
      content:
        '固收实习强调信息处理速度和框架化表达。我每天在开盘前更新关键利率与政策信号，盘后完成简短策略复盘。建议用统一模板记录“事件-影响路径-交易含义”，久而久之会形成自己的分析体系。导师最看重的是你是否能稳定输出高质量观点，而不只是偶尔写出一篇好报告。',
      applicableTo: '目标固收/宏观研究实习岗位的同学',
      outcome: '获得中金固收组延长实习机会与推荐评价',
      sourceNote: '模拟案例：固收研究实习周报',
      tags: ['中金', '固收', '宏观', '策略', '实习'],
    },
  },
  {
    senior: {
      name: '谢宛宁',
      school: '四川大学',
      major: '软件工程',
      graduationYear: 2023,
      destination: '网易伏羲 NLP 算法工程师',
      direction: 'AI 求职',
      intro: 'NLP 方向积累两段实习，毕业后进入网易伏羲，负责对话系统和知识增强能力。',
    },
    entry: {
      title: 'NLP 求职：把论文实现转成业务价值表达',
      category: ExperienceCategory.JOB_HUNT,
      content:
        '我在面试中避免只讲模型结构，而是强调“在什么业务场景解决了什么问题”。例如知识增强问答项目中，重点展示召回准确率提升和人工标注成本下降。建议至少准备一个完整从数据清洗到上线评估的项目，这类经历比单纯复现论文更有说服力。',
      applicableTo: '目标 NLP/对话系统岗位的同学',
      outcome: '拿到网易伏羲与科大讯飞 NLP 岗 offer',
      sourceNote: '模拟案例：NLP 校招项目表达',
      tags: ['NLP', '网易', '对话系统', '知识增强', '算法工程师'],
    },
  },
  {
    senior: {
      name: '郑书豪',
      school: '吉林大学',
      major: '材料科学与工程',
      graduationYear: 2022,
      destination: '小米 后端开发工程师',
      direction: '跨专业转码',
      intro: '大三决定转码，靠项目实战和系统化刷题在一年内完成赛道切换。',
    },
    entry: {
      title: '材料转码：一年转型的可执行计划',
      category: ExperienceCategory.CAREER_PLANNING,
      content:
        '我把转码拆为四个阶段：语言基础、数据结构与算法、后端项目、面试冲刺。每个阶段都有明确产出，比如可部署项目、题单完成率和复盘文档。关键是不要只刷题，必须同步做项目，否则简历缺少真实工程证据。跨专业同学可先争取中小厂实习，再冲大厂校招。',
      applicableTo: '非计算机专业转后端/开发岗位的同学',
      outcome: '秋招获得小米与滴滴后端岗位 offer',
      sourceNote: '模拟案例：跨专业转码规划',
      tags: ['转码', '跨专业', '后端', '项目实战', '职业规划'],
    },
  },
  {
    senior: {
      name: '宋知夏',
      school: '山东大学',
      major: '计算机科学与技术',
      graduationYear: 2025,
      destination: 'UC Berkeley EECS 直博',
      direction: '海外直博',
      intro: '以可信 AI 方向为主线，连续产出科研成果并建立国际合作，最终录取 Berkeley EECS 直博。',
    },
    entry: {
      title: 'Berkeley 直博：研究问题选择比工具更重要',
      category: ExperienceCategory.RESEARCH,
      content:
        '我在准备直博时刻意避免“追热点”，而是选择有长期价值的问题：模型鲁棒性与可解释性。项目中持续做 ablation 与失败案例分析，保证论文不是“只在某个数据集有效”。套磁邮件要短且具体，强调你和教授课题的重叠点，而不是泛泛表达崇拜。研究叙事清晰后，申请材料会形成强一致性。',
      applicableTo: '目标美国 CS 直博、关注可信 AI 研究的学生',
      outcome: '获得 Berkeley EECS PhD 录取与奖学金支持',
      sourceNote: '模拟案例：可信 AI 方向直博申请',
      tags: ['Berkeley', '直博', '可信AI', '套磁', '论文'],
    },
  },
  {
    senior: {
      name: '顾铭泽',
      school: '东南大学',
      major: '信息工程',
      graduationYear: 2023,
      destination: '字节跳动 抖音推荐研发',
      direction: '推荐系统',
      intro: '通过推荐系统实验室项目与实习经历，毕业后进入字节抖音推荐团队。',
    },
    entry: {
      title: '推荐系统入门到求职：先做召回再做排序',
      category: ExperienceCategory.COURSE_SELECTION,
      content:
        '课程和项目选择上，我建议先把机器学习、数据库、分布式系统打牢，再深入推荐算法。很多同学直接冲复杂模型，但忽略了召回和特征工程。实际业务里，召回链路和工程稳定性同样决定效果上限。选课时优先能做大作业和课程项目的课，方便沉淀可讲述成果。',
      applicableTo: '希望进入推荐系统方向的大三/研一同学',
      outcome: '拿到字节与腾讯推荐研发 offer',
      sourceNote: '模拟案例：推荐系统方向选课与求职',
      tags: ['推荐系统', '字节跳动', '选课', '召回', '特征工程'],
    },
  },
  {
    senior: {
      name: '唐婉仪',
      school: '南京航空航天大学',
      major: '数据科学',
      graduationYear: 2024,
      destination: '小红书 数据分析师',
      direction: '数据分析',
      intro: '通过业务分析实习积累增长分析能力，毕业后入职小红书商业分析团队。',
    },
    entry: {
      title: '数据分析岗：SQL 与业务理解缺一不可',
      category: ExperienceCategory.JOB_HUNT,
      content:
        '数据分析面试不只是 SQL 题，更关注你是否能从指标异常追到业务原因。我准备了三个案例：拉新漏斗优化、内容分发策略复盘和活动 ROI 评估。每个案例都强调“问题拆解-指标体系-实验设计-结论建议”。建议同学提前训练汇报表达能力，分析岗非常看重沟通。',
      applicableTo: '目标互联网数据分析、商业分析岗位的学生',
      outcome: '拿到小红书、B 站数据分析岗位 offer',
      sourceNote: '模拟案例：互联网数据分析求职',
      tags: ['数据分析', '小红书', 'SQL', '增长', '实验设计'],
    },
  },
  {
    senior: {
      name: '陆景川',
      school: '哈尔滨工业大学',
      major: '计算机科学与技术',
      graduationYear: 2023,
      destination: '微软亚洲研究院 联合培养',
      direction: '科研',
      intro: '在自然语言处理与多模态方向持续科研，参与 MSRA 联合培养项目并发表顶会论文。',
    },
    entry: {
      title: '科研训练：从复现到提出自己的问题',
      category: ExperienceCategory.RESEARCH,
      content:
        '科研初期我用 3 个月集中做复现，目标不是跑通代码，而是理解实验变量与失败原因。随后在导师指导下，把一个负结果转化为新问题，并最终形成论文。建议大家做科研时建立实验日志，记录每次改动与观察，否则很难高效迭代。顶会产出依赖长期稳定积累，不是短期冲刺。',
      applicableTo: '希望走 NLP/多模态科研路线的同学',
      outcome: '以学生一作发表 ACL 论文并获得联合培养机会',
      sourceNote: '模拟案例：NLP 科研训练路径',
      tags: ['科研', 'MSRA', 'NLP', '论文', '实验日志'],
    },
  },
];

async function ensureTagIds(tags) {
  const uniqueTags = [...new Set(tags.map((tag) => tag.trim()).filter(Boolean))];
  const tagIds = [];
  for (const tag of uniqueTags) {
    const record = await prisma.tag.upsert({
      where: { name: tag },
      update: {},
      create: { name: tag },
      select: { id: true },
    });
    tagIds.push(record.id);
  }
  return tagIds;
}

async function ensureSeniorProfile(senior) {
  const existed = await prisma.seniorProfile.findFirst({
    where: {
      name: senior.name,
      school: senior.school,
      destination: senior.destination ?? null,
      deletedAt: null,
    },
    select: { id: true },
  });
  if (existed) return { id: existed.id, created: false };

  const created = await prisma.seniorProfile.create({
    data: senior,
    select: { id: true },
  });
  return { id: created.id, created: true };
}

async function ensureExperienceEntry(seniorProfileId, entry) {
  const existed = await prisma.experienceEntry.findFirst({
    where: {
      seniorProfileId,
      title: entry.title,
      deletedAt: null,
    },
    select: { id: true },
  });
  if (existed) return { id: existed.id, created: false };

  const tagIds = await ensureTagIds(entry.tags);
  const created = await prisma.experienceEntry.create({
    data: {
      seniorProfileId,
      title: entry.title,
      category: entry.category,
      content: entry.content,
      applicableTo: entry.applicableTo,
      outcome: entry.outcome,
      sourceNote: entry.sourceNote,
      tags: {
        create: tagIds.map((tagId) => ({ tagId })),
      },
    },
    select: { id: true },
  });
  return { id: created.id, created: true };
}

async function main() {
  let createdSeniors = 0;
  let createdEntries = 0;

  for (const record of mockRecords) {
    const seniorResult = await ensureSeniorProfile(record.senior);
    if (seniorResult.created) createdSeniors += 1;

    const entryResult = await ensureExperienceEntry(seniorResult.id, record.entry);
    if (entryResult.created) createdEntries += 1;
  }

  console.log(`Seed completed. Seniors created: ${createdSeniors}, entries created: ${createdEntries}.`);
  console.log(`Total mock records configured: ${mockRecords.length}`);
}

main()
  .catch((error) => {
    console.error('Seed failed:', error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
