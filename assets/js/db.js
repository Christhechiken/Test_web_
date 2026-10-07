// Kho dữ liệu demo trong localStorage; không đồng bộ thiết bị và chưa kết nối máy chủ.
const DB_KEY = 'minischool_db_v2';

const initialData = {
  admin: {
    id: 1,
    memberId: '2531540120',
    name: 'Nguyễn Trần Nhật Quyền',
    user: 'admin',
    pass: '12345',
    email: 'minischool09@gmail.com',
    avatar: '../assets/images/profiles/nguyen-tran-nhat-quyen.jpg',
    schedule: [
      { period: 'Sáng', days: ['Vocab', 'Listening', '', 'Reading', 'Vocab', '', ''] },
      { period: 'Trưa', days: ['Speaking', '', 'Reading', 'Vocab', 'Writing', 'Listening', ''] },
      { period: 'Chiều', days: ['', '', 'Speaking', 'Writing', '', '', ''] }
    ]
  },
  students: [
    {
      id: 2,
      memberId: '2531540033',
      name: 'Trần Long Khang',
      user: 'student1',
      pass: '12345',
      email: 'khang.student@example.com',
      avatar: '../assets/images/profiles/tran-long-khang.jpg',
      className: 'Tiếng Anh giao tiếp A2',
      schedule: [
        { period: 'Sáng', days: ['Vocab', '', '', '', 'Reading', 'Listening', ''] },
        { period: 'Trưa', days: ['', 'Vocab', 'Speaking', 'Writing', 'Writing', '', ''] },
        { period: 'Chiều', days: ['', 'Reading', 'Listening', '', 'Speaking', '', ''] }
      ]
    },
    {
      id: 3,
      memberId: '2531540055',
      name: 'Nguyễn Minh Triết',
      user: 'student2',
      pass: '12345',
      email: 'triet.student@example.com',
      avatar: '../assets/images/profiles/nguyen-minh-triet.jpg',
      className: 'IELTS Foundation',
      schedule: [
        { period: 'Sáng · 8:00–9:30', days: ['IELTS Vocabulary', 'IELTS Vocabulary', '', '', '', '', ''] },
        { period: 'Trưa · 15:30–17:00', days: ['IELTS Speaking', 'IELTS Reading', '', 'IELTS Listening', 'IELTS Writing', 'IELTS Listening', ''] },
        { period: 'Tối · 19:00–20:30', days: ['', '', '', '', '', '', ''] }
      ]
    },
    {
      id: 4,
      memberId: '2531540059',
      name: 'Phùng Phúc Tân',
      user: 'student3',
      pass: '12345',
      email: 'tan.student@example.com',
      avatar: '../assets/images/profiles/phung-phuc-tan.jpg',
      className: 'Tiếng Anh giao tiếp A2',
      schedule: [
        { period: 'Sáng', days: ['Reading', 'Listening', '', 'Reading', 'Listening', '', ''] },
        { period: 'Trưa', days: ['Vocab', '', 'Vocab', '', 'Writing', 'Vocab', ''] },
        { period: 'Chiều', days: ['', '', 'Speaking', 'Speaking', '', 'Writing', ''] }
      ]
    }
  ],
  teachers: [
    {
      id: 5,
      memberId: '2531540517',
      name: 'Lương Thị Mỹ Hương',
      user: 'teacher1',
      pass: '12345',
      email: 'huong.teacher@example.com',
      avatar: '../assets/images/profiles/luong-thi-my-huong.jpg',
      subject: 'Tiếng Anh tổng quát',
      schedule: [
        { period: 'Sáng', days: ['Speaking', '', '', 'Writing', 'Reading', 'Listening', ''] },
        { period: 'Trưa', days: ['', 'Vocab', 'Listening', 'Vocab', 'Writing', '', ''] },
        { period: 'Chiều', days: ['', 'Reading', 'Speaking', '', '', '', ''] }
      ]
    }
  ],
  requests: []
};

const copyInitialData = () => JSON.parse(JSON.stringify(initialData));
const mergePeople = (savedPeople, defaults) => {
  if (!Array.isArray(savedPeople)) return JSON.parse(JSON.stringify(defaults));
  return savedPeople.map((person) => ({
    ...(defaults.find((item) => item.user === person.user) || {}),
    ...person
  }));
};

const db = {
  get() {
    try {
      const saved = JSON.parse(localStorage.getItem(DB_KEY) || 'null');
      if (!saved || typeof saved !== 'object') return copyInitialData();
      return {
        admin: { ...initialData.admin, ...(saved.admin || {}) },
        students: mergePeople(saved.students, initialData.students),
        teachers: mergePeople(saved.teachers, initialData.teachers),
        requests: Array.isArray(saved.requests) ? saved.requests : []
      };
    } catch {
      return copyInitialData();
    }
  },
  save(data) {
    localStorage.setItem(DB_KEY, JSON.stringify(data));
  }
};
