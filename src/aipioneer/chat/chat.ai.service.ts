import { Injectable } from '@nestjs/common';
import axios from 'axios';

type LlmHistoryMessage = {
  role: 'user' | 'assistant';
  content: string;
};

type ContextEntry = {
  id: number;
  title: string;
  category: string;
  content: string;
  applicableTo: string | null;
  outcome: string | null;
  seniorProfile: {
    name: string;
    school: string;
    direction: string | null;
  };
  tags: string[];
};

@Injectable()
export class ChatAiService {
  async answerWithContext(params: {
    question: string;
    contextEntries: ContextEntry[];
    history: LlmHistoryMessage[];
  }): Promise<{
    content: string;
    model: string;
    tokenUsage?: number;
    contextSummary: string;
  }> {
    const contextSummary = this.buildContextSummary(params.contextEntries);
    const apiKey = process.env.AI_API_KEY;
    const model = process.env.AI_MODEL ?? 'gpt-4o-mini';

    if (!apiKey) {
      return {
        model: 'local-fallback',
        content: this.buildFallbackAnswer(params.question, params.contextEntries),
        contextSummary,
      };
    }

    const baseUrl = (process.env.AI_API_BASE_URL ?? 'https://api.openai.com/v1').replace(
      /\/+$/,
      '',
    );

    const messages = [
      {
        role: 'system',
        content:
          '你是“AI前辈”助手。请严格基于提供的资料回答，给出可执行建议。若资料不足，明确说明不确定性并建议补充信息。请使用简洁中文作答。',
      },
      ...params.history.map((item) => ({ role: item.role, content: item.content })),
      {
        role: 'user',
        content: [
          `用户问题：${params.question}`,
          '',
          '资料上下文（按相关性排序）：',
          contextSummary,
          '',
          '请按如下结构回答：',
          '1) 结论',
          '2) 建议步骤',
          '3) 注意事项',
          '4) 可参考资料编号（如 [E12], [E15]）',
        ].join('\n'),
      },
    ];

    const response = await axios.post(
      `${baseUrl}/chat/completions`,
      {
        model,
        temperature: 0.2,
        messages,
      },
      {
        headers: {
          Authorization: `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
        },
        timeout: 30000,
      },
    );

    const content = response.data?.choices?.[0]?.message?.content;
    const tokenUsage = response.data?.usage?.total_tokens as number | undefined;

    return {
      content: typeof content === 'string' ? content : '暂时无法生成回答，请稍后再试。',
      model: response.data?.model ?? model,
      tokenUsage,
      contextSummary,
    };
  }

  private buildContextSummary(entries: ContextEntry[]): string {
    if (!entries.length) return '暂无可用资料。';

    return entries
      .map((entry) => {
        const snippet = entry.content.slice(0, 260);
        return [
          `[E${entry.id}] ${entry.title} | 类别:${entry.category}`,
          `师兄师姐: ${entry.seniorProfile.name} (${entry.seniorProfile.school}${entry.seniorProfile.direction ? `, ${entry.seniorProfile.direction}` : ''})`,
          `标签: ${entry.tags.length ? entry.tags.join(', ') : '无'}`,
          `要点: ${snippet}`,
        ].join('\n');
      })
      .join('\n\n');
  }

  private buildFallbackAnswer(question: string, entries: ContextEntry[]): string {
    if (!entries.length) {
      return [
        '目前资料库中暂时没有足够内容支撑这个问题。',
        '建议先补充对应方向的师兄师姐经验（例如目标岗位、年级、投递策略、时间线）。',
      ].join('\n');
    }

    const top = entries.slice(0, 3);
    const refs = top.map((item) => `[E${item.id}] ${item.title}`).join('；');
    return [
      `基于现有资料，先给你一个可执行的初版建议：`,
      `- 问题聚焦：${question}`,
      `- 建议先按“目标方向 -> 当前差距 -> 4周行动计划”拆解执行。`,
      `- 优先参考：${refs}`,
      `说明：当前回答由本地兜底逻辑生成。配置 AI_API_KEY 后可获得更完整的大模型回答。`,
    ].join('\n');
  }
}
