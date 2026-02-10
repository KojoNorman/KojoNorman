export function getXpForGrade(grade: string): number {
  const gradeMap: Record<string, number> = {
    'Class 1': 5,
    'Class 2': 5,
    'Class 3': 10,
    'Class 4': 10,
    'Class 5': 15,
    'Class 6': 15,
    'JHS 1': 20,
    'JHS 2': 25,
    'JHS 3': 30
  };
  return gradeMap[grade] || 10; // Default to 10 if unknown
}