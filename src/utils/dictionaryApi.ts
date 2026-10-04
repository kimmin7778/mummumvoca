import type { AutoFillResult, DictionaryApiResponse } from '../types/voca';

// Smart offline Korean lookup dictionary for instant enrichment of standard vocabulary
const KOREAN_WORD_DATABASE: Record<string, { pos: string; meaning: string; example: string; exampleMeaning: string }> = {
  apple: { pos: 'n.', meaning: '사과', example: 'She ate a sweet red apple.', exampleMeaning: '그녀는 달콤한 빨간 사과를 먹었다.' },
  banana: { pos: 'n.', meaning: '바나나', example: 'Monkeys love eating bananas.', exampleMeaning: '원숭이들은 바나나 먹는 것을 좋아한다.' },
  cat: { pos: 'n.', meaning: '고양이', example: 'The cat is sleeping on the warm sofa.', exampleMeaning: '고양이가 따뜻한 소파 위에서 자고 있다.' },
  dog: { pos: 'n.', meaning: '개, 강아지', example: 'A friendly dog ran up to greet us.', exampleMeaning: '친근한 강아지가 우리를 반기러 달려왔다.' },
  effort: { pos: 'n.', meaning: '노력, 수고', example: 'Success requires constant effort and hard work.', exampleMeaning: '성공은 지속적인 노력과 수고를 요구한다.' },
  focus: { pos: 'v.', meaning: '집중하다, 초점을 맞추다', example: 'You need to focus on your main goals.', exampleMeaning: '너는 너의 주요 목표에 집중할 필요가 있다.' },
  grace: { pos: 'n.', meaning: '우아함, 품위', example: 'She danced across the stage with grace.', exampleMeaning: '그녀는 우아하게 무대 위에서 춤을 췄다.' },
  honest: { pos: 'adj.', meaning: '정직한, 솔직한', example: 'He gave an honest answer to the difficult question.', exampleMeaning: '그는 어려운 질문에 정직한 대답을 했다.' },
  imagine: { pos: 'v.', meaning: '상상하다, 마음속에 그리다', example: 'Imagine living in a world full of harmony.', exampleMeaning: '조화로 가득 찬 세상에서 사는 것을 상상해 보세요.' },
  journey: { pos: 'n.', meaning: '여정, 여행', example: 'Life is a long journey of learning.', exampleMeaning: '인생은 배움의 긴 여정이다.' },
  knowledge: { pos: 'n.', meaning: '지식, 학식', example: 'Knowledge is power when put into action.', exampleMeaning: '지식은 행동으로 옮겨질 때 힘이 된다.' },
  lead: { pos: 'v.', meaning: '이끌다, 지도하다', example: 'She will lead the new project team.', exampleMeaning: '그녀는 새 프로젝트 팀을 이끌 것이다.' },
  motivate: { pos: 'v.', meaning: '동기를 부여하다', example: 'A good leader knows how to motivate people.', exampleMeaning: '훌륭한 리더는 사람들에게 동기를 부여하는 법을 안다.' },
  navigate: { pos: 'v.', meaning: '길을 찾다, 항해하다', example: 'We used GPS to navigate through the crowded city.', exampleMeaning: '우리는 붐비는 도시를 구경하며 길을 찾기 위해 GPS를 사용했다.' },
  opportunity: { pos: 'n.', meaning: '기회', example: 'Don\'t miss this great career opportunity.', exampleMeaning: '이 좋은 커리어 기회를 놓치지 마세요.' },
  persist: { pos: 'v.', meaning: '지속하다, 포기하지 않다', example: 'If you persist, you will achieve your dreams.', exampleMeaning: '포기하지 않고 지속한다면 꿈을 이룰 것이다.' },
  quality: { pos: 'n.', meaning: '품질, 특성', example: 'They focus on delivering high quality products.', exampleMeaning: '그들은 고품질의 제품을 제공하는 데 집중한다.' },
  resilient: { pos: 'adj.', meaning: '회복력 있는, 굴하지 않는', example: 'Children are remarkably resilient during tough times.', exampleMeaning: '아이들은 힘든 시기에도 놀라울 정도로 회복력이 뛰어나다.' },
  strategy: { pos: 'n.', meaning: '전략, 계책', example: 'We need a clear strategy to win the project.', exampleMeaning: '우리는 프로젝트를 수주하기 위해 명확한 전략이 필요하다.' },
  triumph: { pos: 'n.', meaning: '승리, 대성공', example: 'Their hard work ended in complete triumph.', exampleMeaning: '그들의 노고는 완전한 승리로 끝났다.' },
};

/**
 * Fetches definition, POS, phonetics, and example sentences from Free Dictionary API,
 * with fallback to built-in Korean dictionary dictionary lookup.
 */
export async function fetchWordDefinition(inputWord: string): Promise<AutoFillResult> {
  const trimmedWord = inputWord.trim().toLowerCase();
  if (!trimmedWord) {
    throw new Error('단어를 입력해주세요.');
  }

  const result: AutoFillResult = {
    word: inputWord.trim(),
  };

  // Check built-in database first for Korean translation
  const localData = KOREAN_WORD_DATABASE[trimmedWord];
  if (localData) {
    result.pos = localData.pos;
    result.meaning = localData.meaning;
    result.example = localData.example;
    result.exampleMeaning = localData.exampleMeaning;
  }

  try {
    const res = await fetch(`https://api.dictionaryapi.dev/api/v2/entries/en/${encodeURIComponent(trimmedWord)}`);
    if (res.ok) {
      const data: DictionaryApiResponse[] = await res.json();
      if (data && data.length > 0) {
        const entry = data[0];

        // Phonetic
        result.phonetic = entry.phonetic || entry.phonetics?.find(p => p.text)?.text || '';
        
        // Audio
        const audioObj = entry.phonetics?.find(p => p.audio && p.audio.length > 0);
        if (audioObj?.audio) {
          result.audioUrl = audioObj.audio;
        }

        // Meanings & Examples
        if (entry.meanings && entry.meanings.length > 0) {
          const firstMeaning = entry.meanings[0];
          if (!result.pos && firstMeaning.partOfSpeech) {
            result.pos = firstMeaning.partOfSpeech;
          }

          if (firstMeaning.definitions && firstMeaning.definitions.length > 0) {
            const defObj = firstMeaning.definitions[0];
            // If we don't have a Korean meaning yet, we can set the English definition as fallback
            if (!result.meaning) {
              result.meaning = defObj.definition;
            }
            if (!result.example && defObj.example) {
              result.example = defObj.example;
            }
          }
        }
      }
    }
  } catch (err) {
    console.warn('Free Dictionary API call failed or offline:', err);
  }

  // Fallback defaults if empty
  if (!result.pos) result.pos = 'n.';
  if (!result.meaning) result.meaning = `${inputWord} (의미를 입력해주세요)`;
  if (!result.example) result.example = `This is an example sentence using the word "${inputWord}".`;
  if (!result.exampleMeaning) result.exampleMeaning = `이것은 "${inputWord}" 단어를 사용한 예문입니다.`;

  return result;
}
