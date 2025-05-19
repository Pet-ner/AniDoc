// app/test-hospitalization/page.tsx

'use client';

import React from 'react';
import NewHospitalizationRecord from '@/components/hospitalizationrecord/NewHospitalizationRecord';

const TestPage = () => {
  const handleSubmit = (data: any) => {
    console.log('제출된 데이터:', data);
  };

  return (
    <div>
      <h1>입원 기록 테스트 페이지</h1>
      <NewHospitalizationRecord onSubmit={handleSubmit} />
    </div>
  );
};

export default TestPage;
