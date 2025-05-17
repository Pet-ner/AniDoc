// 날짜 포맷 변경 (YYYY-MM-DD -> YYYY년 MM월 DD일)
export const formatDateToKorean = (dateString: string): string => {
  const [year, month, day] = dateString.split("-");
  return `${year}년 ${month}월 ${day}일`;
};
