// 内容整理工具 - 结构化分析法

// ==================== 基础工具函数 ====================

function stripHtml(html: string): string {
  return html
    .replace(/<[^>]*>/g, '\n')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/\n\s*\n/g, '\n')
    .trim();
}

function cleanTranscript(text: string): string {
  return text
    .replace(/说话人[A-Z]\s*\d{1,2}:\d{2}(:\d{2})?/g, '')
    .replace(/\d{1,2}:\d{2}(:\d{2})?/g, '')
    .replace(/说话人[A-Z]/g, '')
    .replace(/^\d+$/gm, '')
    .replace(/\n{3,}/g, '\n\n')
    .trim();
}

// 清理句子中的口语化填充词
function cleanOralFillers(sentence: string): string {
  return sentence
    // 去除句首口语填充
    .replace(/^(然后|就是|所以|因为|其实|反正|基本上|差不多|可能|大概|也许|这个|那个|好的|对|嗯|啊|哦|呃|你看|你想|你知道吗|怎么说呢|简单来说|接下里|接下来),?\s*/g, '')
    // 去除句中口语填充
    .replace(/(然后|就是说|怎么说呢|那个什么|对吧|是吧|有没有|是不是|对不对|你知道|你看|你想|其实吧|反正就是|基本上就是|差不多就是这样|大概就是这样|嗯对|嗯好|啊对|哦对|好的好的|行行行|对对对|是这样的|就是这样的),?\s*/g, '')
    // 去除重复的连接词
    .replace(/(然后){2,}/g, '然后')
    .replace(/(就是){2,}/g, '就是')
    .replace(/(所以){2,}/g, '所以')
    // 清理多余空格
    .replace(/\s{2,}/g, ' ')
    .trim();
}

function splitSentences(text: string): string[] {
  return text
    .split(/[。！？；\n.!?;]+/)
    .map(s => s.trim())
    .filter(s => s.length >= 8);
}

function isUsefulSentence(sentence: string): boolean {
  // 单字/单词无意义模式
  const uselessPatterns = [
    /^哈+$/, /^嗯+$/, /^啊+$/, /^哦+$/, /^呃+$/, /^嘿+$/,
    /^好的?$/, /^是的?$/, /^对的?$/, /^行$/, /^好吧$/,
    /^ok$/i, /^yes$/i, /^no$/i, /^right$/i, /^yeah$/i,
    /^了$/, /^的$/, /^呢$/, /^吧$/, /^吗$/, /^嘛$/, /^呀$/,
    /^诶$/, /^唉$/, /^哎$/, /^哇$/, /^哟$/, /^喂$/,
    /^哈哈哈$/, /^呵呵$/, /^嘿嘿$/,
    /^看$/, /^听$/, /^说$/, /^想$/, /^来$/, /^去$/,
    /^你$/, /^我$/, /^他$/, /^她$/, /^它$/, /^我们$/, /^你们$/, /^他们$/,
    /^这个$/, /^那个$/, /^什么$/, /^怎么$/, /^这儿$/, /^那儿$/,
    /^不是$/, /^没有$/, /^不会$/, /^不能$/, /^不行$/,
    /^可以$/, /^应该$/, /^需要$/, /^可能$/, /^大概$/, /^也许$/,
    /^同学$/, /^同学们$/, /^大家$/, /^老师$/, /^各位$/,
    /^好$/, /^对$/, /^是$/, /^不$/, /^嗯$/, /^啊$/,
  ];

  // 口语化短语/过渡词模式
  const oralPatterns = [
    /^然后然后/, /^就是说/, /^怎么说呢/, /^那个什么/,
    /^其实吧/, /^反正就是/, /^基本上就是/, /^差不多/,
    /^我觉得吧/, /^你知道吗/, /^你看/, /^你想/,
    /^所以说嘛/, /^对吧$/, /^是不是$/, /^有没有$/,
    /^这样的话/, /^那样的话/, /^怎么说/,
    /^简单来说就是$/, /^大概就是这样$/,
    /^嗯对$/, /^嗯好$/, /^啊对$/, /^哦对$/,
    /^好的好的$/, /^行行行$/, /^对对对$/,
    /^是这样的$/, /^就是这样的$/,
    /^接下来我们/, /^现在我们/, /^那么我们/,
    /^好我们/, /^好那/, /^好接下/,
    /^同学们?看/, /^同学们?听/, /^同学们?想/,
    /^大家看/, /^大家听/, /^大家想/,
    /^嗯嗯$/, /^哈哈$/, /^嘿嘿$/, /^呵呵$/,
  ];

  // 长度太短直接过滤
  if (sentence.length < 10) return false;

  // 匹配无意义模式
  if (uselessPatterns.some(p => p.test(sentence))) return false;
  if (oralPatterns.some(p => p.test(sentence))) return false;

  // 纯数字/符号
  if (/^[\d\s\.,;:!?\-]+$/.test(sentence)) return false;

  // 说话人标记和时间戳
  if (/^说话人/.test(sentence)) return false;
  if (/^\d{1,2}:\d{2}/.test(sentence)) return false;

  // 计算信息密度：有效字符占比
  const cleaned = sentence.replace(/[\s\.,;:!?\-，。！？；：、""''（）\(\)]/g, '');
  if (cleaned.length < 6) return false;

  // 口语化内容占比过高则过滤
  const oralWords = ['然后', '就是', '所以', '因为', '这个', '那个', '其实', '反正',
    '基本上', '差不多', '可能', '大概', '也许', '应该', '觉得', '认为',
    '好吧', '对吧', '是吧', '对吧', '有没有', '是不是', '怎么说'];
  const oralCount = oralWords.reduce((acc, w) => {
    return acc + (sentence.includes(w) ? 1 : 0);
  }, 0);
  const words = sentence.length;
  if (words < 20 && oralCount >= 2) return false;

  return true;
}

function extractKeywords(text: string): string[] {
  const commonWords = new Set([
    // 基础虚词
    '的', '了', '在', '是', '我', '有', '和', '就', '不', '人', '都', '一', '一个',
    '上', '也', '很', '到', '说', '要', '去', '你', '会', '着', '没有', '看', '好',
    '自己', '这', '他', '她', '它', '们', '那', '被', '从', '把', '过', '对', '以',
    '而', '但', '如果', '可以', '这个', '那个', '什么', '怎么', '为什么', '因为', '所以',
    '虽然', '但是', '然后', '已经', '还是', '或者', '以及', '而且', '不是', '就是',
    '同学', '老师', '咱们', '大家', '你们', '我们', '他们',
    // 口语化填充词
    '其实', '反正', '基本上', '差不多', '可能', '大概', '也许', '应该',
    '觉得', '认为', '好吧', '对吧', '是吧', '有没有', '是不是', '怎么说',
    '怎么说呢', '就是说', '那个什么', '其实吧', '反正就是', '基本上就是',
    '你知道', '你看', '你想', '接下来', '现在', '那么', '这样的话',
    '那样的话', '简单来说', '差不多就是这样', '大概就是这样',
    '好的好的', '行行行', '对对对', '是这样的', '就是这样的',
    '嗯嗯', '哈哈', '嘿嘿', '呵呵', '嗯', '啊', '哦', '呃', '嘿',
    '好的', '对的', '行', '好吧', '诶', '唉', '哎', '哇', '哟',
    '同学们', '各位', '大家好', '同学好',
    // 常见口语动词/副词
    '来说', '来讲', '来看', '来讲讲', '看看', '想想', '听听',
    '想一想', '看一看', '听一听', '讲一讲', '说一说',
  ]);

  const words: string[] = [];
  const cleaned = text.replace(/[^一-龥a-zA-Z0-9]/g, ' ');
  const segments = cleaned.split(/\s+/).filter(s => s.length >= 2 && s.length <= 8);

  segments.forEach(seg => {
    if (!commonWords.has(seg.toLowerCase()) && seg.length >= 2) {
      words.push(seg);
    }
  });

  const freq: Record<string, number> = {};
  words.forEach(w => {
    freq[w] = (freq[w] || 0) + 1;
  });

  return Object.entries(freq)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10)
    .map(([word]) => word);
}

function extractKeySentences(sentences: string[], keywords: string[], maxCount: number = 5): string[] {
  const scored = sentences.map(sentence => {
    const score = keywords.reduce((acc, keyword) => {
      return acc + (sentence.includes(keyword) ? 1 : 0);
    }, 0);
    return { sentence, score, length: sentence.length };
  });

  scored.sort((a, b) => {
    if (b.score !== a.score) return b.score - a.score;
    const aIdeal = Math.abs(a.length - 40);
    const bIdeal = Math.abs(b.length - 40);
    return aIdeal - bIdeal;
  });

  return scored
    .filter(item => item.score > 0)
    .slice(0, maxCount)
    .map(item => item.sentence);
}

function deduplicateSentences(sentences: string[]): string[] {
  const unique: string[] = [];
  const seen = new Set<string>();

  sentences.forEach(sentence => {
    const key = sentence.replace(/[^一-龥a-zA-Z0-9]/g, '').substring(0, 20);
    if (!seen.has(key) && key.length > 5) {
      seen.add(key);
      unique.push(sentence);
    }
  });

  return unique;
}

function extractActionItems(sentences: string[]): string[] {
  const actionKeywords = ['需要', '应该', '必须', '务必', '记得', '不要', '不能', '要', '待办', '任务', '准备', '计划', '下一步', '接下来'];
  return sentences.filter(sentence =>
    actionKeywords.some(keyword => sentence.includes(keyword))
  );
}

// ==================== 步骤1：判断内容类型 ====================

function analyzeContentType(text: string): { type: string; reason: string } {
  const typePatterns: Record<string, { keywords: string[]; reason: string }> = {
    '技术教程': {
      keywords: ['代码', '编程', '开发', '框架', '数据库', '服务器', '前端', '后端', 'html', 'css', 'javascript', 'python', 'java', '标签', '属性', '函数'],
      reason: '包含大量编程术语和技术概念，属于技术教学内容'
    },
    '会议记录': {
      keywords: ['会议', '讨论', '决定', '计划', '任务', '进度', '汇报', '议题', '决议'],
      reason: '包含会议相关词汇，记录了讨论和决策过程'
    },
    '学习笔记': {
      keywords: ['学习', '知识', '原理', '概念', '教程', '课程', '总结', '理解', '掌握'],
      reason: '包含学习相关词汇，是对知识的整理和总结'
    },
    '工作汇报': {
      keywords: ['工作', '项目', '完成', '进度', '问题', '解决方案', '成果', '目标'],
      reason: '包含工作相关词汇，汇报了工作进展和成果'
    },
    '创意想法': {
      keywords: ['想法', '灵感', '创意', '思考', '规划', '目标', '设想', '方案'],
      reason: '包含创意相关词汇，记录了思考和规划过程'
    },
    '培训讲座': {
      keywords: ['同学们', '老师', '讲课', '教学', '学习', '练习', '作业', '考试'],
      reason: '包含教学相关词汇，是培训或讲座的内容记录'
    },
  };

  const plainText = text.toLowerCase();
  let maxScore = 0;
  let contentType = '通用文档';
  let reason = '未识别出特定内容类型';

  Object.entries(typePatterns).forEach(([type, pattern]) => {
    const score = pattern.keywords.reduce((acc, keyword) => {
      return acc + (plainText.includes(keyword) ? 1 : 0);
    }, 0);
    if (score > maxScore) {
      maxScore = score;
      contentType = type;
      reason = pattern.reason;
    }
  });

  return { type: contentType, reason };
}

// ==================== 步骤2：提取信息层级 ====================

function extractInformationHierarchy(
  sentences: string[],
  keywords: string[]
): {
  mainTopics: string[];
  arguments: string[];
  details: string[];
} {
  // 主题：包含最多关键词的句子
  const mainTopics = extractKeySentences(sentences, keywords, 3);

  // 论点：包含行动词或逻辑词的句子
  const logicKeywords = ['因为', '所以', '但是', '然而', '因此', '所以', '如果', '那么', '首先', '其次', '最后'];
  const arguments_ = sentences.filter(s =>
    logicKeywords.some(k => s.includes(k)) && !mainTopics.includes(s)
  ).slice(0, 5);

  // 细节：剩余的有用句子
  const details = sentences.filter(s =>
    !mainTopics.includes(s) && !arguments_.includes(s)
  ).slice(0, 10);

  return {
    mainTopics,
    arguments: arguments_,
    details,
  };
}

// ==================== 步骤3：过滤冗余信息 ====================

function filterRedundancy(sentences: string[]): string[] {
  // 去重
  const unique = deduplicateSentences(sentences);

  // 过滤过短或信息密度低的句子
  return unique.filter(s => {
    // 计算信息密度（关键词比例）
    const words = s.replace(/[^一-龥a-zA-Z0-9]/g, ' ').split(/\s+/);
    const meaningfulWords = words.filter(w => w.length >= 2);
    const density = meaningfulWords.length / words.length;

    return density > 0.3 && s.length >= 10;
  });
}

// ==================== 步骤4：输出高价值总结 ====================

function generateHighValueSummary(
  contentType: string,
  hierarchy: { mainTopics: string[]; arguments: string[]; details: string[] },
  keywords: string[]
): string {
  let summary = '';

  // 核心内容总结（不超过100字）
  const coreSummary = hierarchy.mainTopics.slice(0, 2).join('。');
  summary += `二、核心内容总结\n${coreSummary}\n\n`;

  // 结构化拆解
  summary += '三、结构化拆解\n';
  summary += `- 主要观点：${hierarchy.mainTopics.join('；')}\n`;
  if (hierarchy.arguments.length > 0) {
    summary += `- 支撑逻辑：${hierarchy.arguments.slice(0, 2).join('；')}\n`;
  }
  summary += `- 关键词：${keywords.slice(0, 5).join('、')}\n\n`;

  // 精简版（3行内）
  summary += '四、精简版\n';
  const concisePoints = hierarchy.mainTopics.slice(0, 3);
  concisePoints.forEach((point, i) => {
    summary += `${i + 1}. ${point}\n`;
  });

  return summary;
}

// ==================== 主函数：结构化分析 ====================

export function generateStructuredNote(title: string, content: string, summary?: string): {
  title: string;
  content: string;
  summary: string;
  tags: string[];
  analysis: {
    contentType: string;
    contentTypeReason: string;
    coreSummary: string;
    mainTopics: string[];
    supportingLogic: string[];
    keyMethods: string[];
    conciseVersion: string[];
    transferableApplications: string;
  };
} {
  // 清理内容
  const cleanedContent = cleanTranscript(content);
  const plainText = stripHtml(cleanedContent);
  const allSentences = splitSentences(plainText);

  // 过滤无用句子，并清理口语化填充词
  const usefulSentences = allSentences
    .filter(isUsefulSentence)
    .map(s => cleanOralFillers(s))
    .filter(s => s.length >= 8);

  // 过滤冗余信息
  const filteredSentences = filterRedundancy(usefulSentences);

  // 提取关键词
  const keywords = extractKeywords(plainText);

  // 步骤1：判断内容类型
  const contentTypeResult = analyzeContentType(plainText);

  // 步骤2：提取信息层级
  const hierarchy = extractInformationHierarchy(filteredSentences, keywords);

  // 步骤3：生成核心总结
  const coreSummary = hierarchy.mainTopics.slice(0, 2).join('。') + '。';

  // 步骤4：生成精简版
  const conciseVersion = hierarchy.mainTopics.slice(0, 3);

  // 步骤5：生成可迁移应用
  const transferableApplications = generateTransferableApplications(
    contentTypeResult.type,
    keywords,
    hierarchy.mainTopics
  );

  // 构建结构化内容
  let structuredContent = '';

  // 一、内容类型判断
  structuredContent += '<h3>一、内容类型判断</h3>\n';
  structuredContent += `<p><strong>类型：</strong>${contentTypeResult.type}</p>\n`;
  structuredContent += `<p><strong>理由：</strong>${contentTypeResult.reason}</p>\n\n`;

  // 二、核心内容总结
  structuredContent += '<h3>二、核心内容总结</h3>\n';
  structuredContent += `<p>${coreSummary}</p>\n\n`;

  // 三、结构化拆解
  structuredContent += '<h3>三、结构化拆解</h3>\n';
  structuredContent += '<ul>\n';
  structuredContent += `<li><strong>主要观点：</strong>${hierarchy.mainTopics.join('；')}</li>\n`;
  if (hierarchy.arguments.length > 0) {
    structuredContent += `<li><strong>支撑逻辑：</strong>${hierarchy.arguments.slice(0, 2).join('；')}</li>\n`;
  }
  structuredContent += `<li><strong>关键数据/方法：</strong>${keywords.slice(0, 5).join('、')}</li>\n`;
  structuredContent += '</ul>\n\n';

  // 四、精简版
  structuredContent += '<h3>四、精简版（适合快速复习）</h3>\n';
  structuredContent += '<ol>\n';
  conciseVersion.forEach(point => {
    structuredContent += `<li>${point}</li>\n`;
  });
  structuredContent += '</ol>\n\n';

  // 五、可迁移应用
  structuredContent += '<h3>五、可迁移应用</h3>\n';
  structuredContent += `<p>${transferableApplications}</p>\n\n`;

  // 详细内容（如果有）
  if (hierarchy.details.length > 0) {
    structuredContent += '<h3>详细内容</h3>\n';
    hierarchy.details.forEach(detail => {
      structuredContent += `<p>${detail}</p>\n`;
    });
  }

  return {
    title: title || '未命名笔记',
    content: structuredContent,
    summary: summary || coreSummary,
    tags: keywords.slice(0, 5),
    analysis: {
      contentType: contentTypeResult.type,
      contentTypeReason: contentTypeResult.reason,
      coreSummary,
      mainTopics: hierarchy.mainTopics,
      supportingLogic: hierarchy.arguments,
      keyMethods: keywords.slice(0, 5),
      conciseVersion,
      transferableApplications,
    },
  };
}

// 生成可迁移应用建议
function generateTransferableApplications(
  contentType: string,
  keywords: string[],
  mainTopics: string[]
): string {
  const applications: Record<string, string> = {
    '技术教程': '可应用于实际项目开发中，作为技术参考和最佳实践指南。建议结合实际项目进行练习，加深理解。',
    '会议记录': '可应用于后续工作跟踪和任务分配，确保决议事项得到执行。建议定期回顾，检查进度。',
    '学习笔记': '可应用于知识复习和考试准备，作为快速回顾的参考资料。建议定期复习，巩固记忆。',
    '工作汇报': '可应用于工作总结和绩效评估，展示工作成果和能力。建议提炼关键数据，突出成果。',
    '创意想法': '可应用于项目规划和方案设计，作为创意参考和灵感来源。建议进一步细化，形成可执行方案。',
    '培训讲座': '可应用于教学设计和课程开发，作为教学参考和案例素材。建议结合实际教学场景进行调整。',
    '通用文档': '可应用于信息整理和知识管理，作为参考资料和决策依据。建议定期更新，保持时效性。',
  };

  return applications[contentType] || applications['通用文档'];
}

// 分析内容并推荐分类
export function analyzeCategory(text: string, categories: { id: string; name: string }[]): {
  categoryId: string | null;
  categoryName: string | null;
  suggestedName: string | null;
} {
  const categoryKeywords: Record<string, string[]> = {
    '工作': ['会议', '项目', '任务', '工作', '客户', '报告', '计划', '进度', '需求', '开发', '上线', '产品', '业务'],
    '学习': ['学习', '笔记', '教程', '知识', '课程', '读书', '总结', '原理', '概念', '技术', '理论', '研究'],
    '生活': ['生活', '健康', '运动', '饮食', '旅行', '家人', '朋友', '娱乐', '电影', '音乐', '休闲'],
    '技术': ['代码', '编程', 'bug', 'api', '数据库', '服务器', '前端', '后端', '算法', '框架', '系统', '网络'],
    '想法': ['想法', '灵感', '思考', '计划', '目标', '反思', '总结', '规划', '未来', '创意'],
    '财务': ['财务', '收入', '支出', '预算', '投资', '理财', '账单', '工资'],
    '健康': ['健康', '运动', '锻炼', '饮食', '睡眠', '医院', '药物', '症状'],
  };

  const plainText = text.toLowerCase();
  const scores: Record<string, number> = {};

  Object.entries(categoryKeywords).forEach(([category, keywords]) => {
    const score = keywords.reduce((acc, keyword) => {
      const regex = new RegExp(keyword, 'gi');
      const matches = plainText.match(regex);
      return acc + (matches ? matches.length : 0);
    }, 0);
    if (score > 0) {
      scores[category] = score;
    }
  });

  const sorted = Object.entries(scores).sort((a, b) => b[1] - a[1]);

  if (sorted.length === 0) {
    return { categoryId: null, categoryName: null, suggestedName: null };
  }

  const topCategoryName = sorted[0][0];
  const existing = categories.find(c => c.name === topCategoryName);

  if (existing) {
    return {
      categoryId: existing.id,
      categoryName: existing.name,
      suggestedName: null,
    };
  }

  return {
    categoryId: null,
    categoryName: null,
    suggestedName: topCategoryName,
  };
}
