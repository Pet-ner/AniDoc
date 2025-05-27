/**
 * 알림 시간을 상대적 시간으로 포맷팅
 * @param dateString - ISO 형식의 날짜 문자열
 * @returns 포맷팅된 상대 시간 문자열
 * 
 * 1분 이내: "방금 전"
 * 1시간 이내: "n분 전"
 * 24시간 이내: "n시간 전"
 * 7일 이내: "n일 전"
 * 7일 이후: "YYYY년 MM월 DD일"
 */
export const formatTimeForNotification = (dateString: string): string => {
  const now = new Date();
  const date = new Date(dateString);
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);
  const diffInMinutes = Math.floor(diffInSeconds / 60);
  const diffInHours = Math.floor(diffInMinutes / 60);
  const diffInDays = Math.floor(diffInHours / 24);

  if (diffInSeconds < 60) return '방금 전';
  if (diffInMinutes < 60) return `${diffInMinutes}분 전`;
  if (diffInHours < 24) return `${diffInHours}시간 전`;
  if (diffInDays < 7) return `${diffInDays}일 전`;
  
  return `${date.getFullYear()}년 ${String(date.getMonth() + 1).padStart(2, '0')}월 ${String(date.getDate()).padStart(2, '0')}일`;
};

/**
 * 시스템 점검 시간 등 특정 시간대 포맷팅
 * @param dateTimeString - "YYYY-MM-DD HH:mm" 형식의 문자열
 * @returns "YYYY년 MM월 DD일 HH:mm" 형식의 문자열
 */
export const formatSystemTime = (dateTimeString: string): string => {
  const [date, time] = dateTimeString.split(' ');
  const [year, month, day] = date.split('-');
  return `${year}년 ${month}월 ${day}일 ${time}`;
};