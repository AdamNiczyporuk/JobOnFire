export interface RecruitmentTest {
  id: number;
  jobOfferId: number;
  testJson: any; // structure depends on generator; keep flexible
}
