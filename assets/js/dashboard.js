// Hiển thị hồ sơ và thời khóa biểu demo, đồng thời xử lý thao tác Admin bằng localStorage.
const roleRoutes = {
  admin: { dashboard: 'dashboard.html', students: 'students.html', teachers: 'teachers.html', requests: 'requests.html' },
  teacher: { dashboard: 'dashboard.html', lessons: 'lessons.html', students: 'students.html' },
  student: { dashboard: 'dashboard.html', timetable: 'timetable.html', 'class-detail': 'class-detail.html' }
};
const rolePaths = { admin: 'admin/dashboard.html', teacher: 'teacher/dashboard.html', student: 'student/dashboard.html' };

function readSession() {
  try { return JSON.parse(sessionStorage.getItem('ms_user') || 'null'); }
  catch { return null; }
}

const pageRole = document.body.dataset.role;
const signedInUser = readSession();
if (pageRole === 'router') {
  location.replace(signedInUser && rolePaths[signedInUser.role] ? rolePaths[signedInUser.role] : 'login-register/login.html');
} else if (!signedInUser || signedInUser.role !== pageRole) {
  location.replace(signedInUser && rolePaths[signedInUser.role] ? `../${rolePaths[signedInUser.role]}` : '../login-register/login.html');
} else {
  initializeDashboard(signedInUser, pageRole, document.body.dataset.page);
}

function initializeDashboard(user, role, page) {
  const $ = (id) => document.getElementById(id);
  const escapeHtml = (value) => String(value ?? '').replace(/[&<>"']/g, (character) => `&#${character.charCodeAt(0)};`);
  const data = db.get();
  const rolePeople = { admin: [data.admin], teacher: data.teachers, student: data.students }[role] || [];
  const profile = rolePeople.find((person) => person.id === Number(user.id) || person.user === user.user || person.name === user.name) || rolePeople[0] || {};
  const displayName = profile.name || user.name || 'Thành viên Minischool';
  const days = ['Thứ 2', 'Thứ 3', 'Thứ 4', 'Thứ 5', 'Thứ 6', 'Thứ 7', 'Chủ nhật'];
  const menus = {
    admin: [['dashboard', 'dashboard.html', 'Tổng quan'], ['students', 'students.html', 'Danh sách học viên'], ['teachers', 'teachers.html', 'Danh sách giáo viên'], ['requests', 'requests.html', 'Yêu cầu đăng ký']],
    teacher: [['dashboard', 'dashboard.html', 'Tổng quan'], ['lessons', 'lessons.html', 'Lịch giảng dạy'], ['students', 'students.html', 'Học viên lớp tôi']],
    student: [['dashboard', 'dashboard.html', 'Tổng quan'], ['timetable', 'timetable.html', 'Thời khóa biểu'], ['class-detail', 'class-detail.html', 'Lớp học của tôi']]
  };
  const currentPage = roleRoutes[role][page] ? page : 'dashboard';
  const isAdmin = role === 'admin';

  function pageHeading(kicker, title, description) {
    return `<header class="page-heading"><p class="page-heading__eyebrow">${kicker}</p><h2>${title}</h2><p>${description}</p></header>`;
  }

  function summaryCard(label, value, note) {
    return `<article class="summary-card"><span>${label}</span><strong>${value}<small>${note}</small></strong></article>`;
  }

  function schedule(person = profile) {
    const periods = Array.isArray(person.schedule) ? person.schedule : [];
    const body = periods.map((period) => `<tr><th scope="row">${escapeHtml(period.period)}</th>${days.map((day, index) => {
      const subject = period.days?.[index] || '';
      return `<td>${subject ? `<span class="timetable-subject">${escapeHtml(subject)}</span>` : '<span class="timetable-empty">—</span>'}</td>`;
    }).join('')}</tr>`).join('');
    return `<div class="table-wrap timetable-wrap"><table class="data-table timetable-table"><caption class="visually-hidden">Thời khóa biểu mẫu của ${escapeHtml(person.name || displayName)}</caption><thead><tr><th scope="col">Ca học</th>${days.map((day) => `<th scope="col">${day}</th>`).join('')}</tr></thead><tbody>${body || `<tr><td class="table-empty" colspan="8">Chưa có lịch học mẫu.</td></tr>`}</tbody></table></div>`;
  }

  function homeView() {
    if (role === 'admin') {
      return `${pageHeading('Quản lý Minischool', `Xin chào, ${escapeHtml(displayName)}`, 'Quản lý thành viên, lớp học và yêu cầu đăng ký của trung tâm.')}
        <section class="summary-grid" aria-label="Thống kê trung tâm">${summaryCard('Học viên', data.students.length, 'hồ sơ')}${summaryCard('Giáo viên', data.teachers.length, 'hồ sơ')}${summaryCard('Yêu cầu chờ duyệt', data.requests.length, 'yêu cầu')}</section>
        <section class="welcome-panel"><div><h3>Quản lý trung tâm ngoại ngữ Minischool</h3><p>Nhóm 9 · Theo dõi hồ sơ học viên, giáo viên và lịch học mẫu.</p><a class="button button--quiet" href="students.html">Xem học viên</a></div><span class="welcome-panel__mark" aria-hidden="true">09</span></section>
        <section class="dashboard-card"><div class="dashboard-card__heading"><div><h3>Thời khóa biểu cá nhân</h3><p>${escapeHtml(displayName)} · dữ liệu mẫu được cung cấp</p></div></div>${schedule()}</section>`;
    }
    if (role === 'teacher') {
      return `${pageHeading('Không gian giáo viên', `Xin chào, ${escapeHtml(displayName)}`, `Môn phụ trách: ${escapeHtml(profile.subject || 'Tiếng Anh')}. Theo dõi học viên và lịch giảng dạy.`)}
        <section class="summary-grid" aria-label="Tổng quan giảng dạy">${summaryCard('Học viên', data.students.length, 'trong trung tâm')}${summaryCard('Ca học mẫu', profile.schedule?.length || 0, 'ca / tuần')}${summaryCard('Lớp phụ trách', '02', 'lớp ngoại ngữ')}</section>
        <section class="dashboard-card"><div class="dashboard-card__heading"><div><h3>Thời khóa biểu giảng dạy</h3><p>Lịch cá nhân theo tài liệu nhóm gửi</p></div><a class="text-link" href="lessons.html">Mở lịch</a></div>${schedule()}</section>`;
    }
    return `${pageHeading('Không gian học viên', `Xin chào, ${escapeHtml(displayName)}`, `Mã học viên ${escapeHtml(profile.memberId || 'đang cập nhật')} · ${escapeHtml(profile.className || 'Lớp ngoại ngữ')}.`)}
      <section class="summary-grid" aria-label="Tổng quan học tập">${summaryCard('Lớp đang tham gia', '01', 'lớp học')}${summaryCard('Buổi học mẫu', profile.schedule?.length || 0, 'ca / tuần')}${summaryCard('Trạng thái', 'Đang học', 'học viên')}</section>
      <section class="welcome-panel"><div><h3>Lịch học dành cho bạn</h3><p>Thời khóa biểu bên dưới được lấy từ dữ liệu mẫu của thành viên.</p><a class="button button--quiet" href="class-detail.html">Thông tin lớp</a></div><span class="welcome-panel__mark" aria-hidden="true">M</span></section>
      <section class="dashboard-card"><div class="dashboard-card__heading"><div><h3>Thời khóa biểu tuần này</h3><p>${escapeHtml(profile.className || 'Lịch học mẫu')}</p></div><a class="text-link" href="timetable.html">Xem riêng lịch</a></div>${schedule()}</section>`;
  }

  function peopleView(key, title, description) {
    const people = data[key] || [];
    const form = isAdmin ? `<form class="inline-form" data-key="${key}">
      <div class="inline-form__field"><label for="new-${key}-name">Họ và tên</label><input id="new-${key}-name" name="name" autocomplete="name" placeholder="Nhập họ tên" required></div>
      <div class="inline-form__field"><label for="new-${key}-username">Tên đăng nhập</label><input id="new-${key}-username" name="user" autocomplete="username" placeholder="Tạo tên đăng nhập" required></div>
      <div class="inline-form__field"><label for="new-${key}-email">Email</label><input id="new-${key}-email" name="email" type="email" autocomplete="email" placeholder="name@example.com" required></div>
      <button class="button" type="submit">Thêm thành viên</button>
    </form>` : '';
    const extraLabel = key === 'students' ? 'Mã học viên / lớp' : 'Môn phụ trách';
    const rows = people.map((person) => {
      const avatar = escapeHtml(person.avatar || '../assets/images/favicon/favicon-32x32.png');
      const detail = key === 'students' ? `${person.memberId || '—'} · ${person.className || 'Chưa xếp lớp'}` : (person.subject || 'Tiếng Anh');
      return `<tr><td><div class="member-cell"><img src="${avatar}" alt="" width="40" height="40" loading="lazy"><span><strong>${escapeHtml(person.name)}</strong><small>${escapeHtml(person.memberId || 'Thành viên Minischool')}</small></span></div></td><td>${escapeHtml(person.user)}</td><td>${escapeHtml(person.email)}</td><td>${escapeHtml(detail)}</td>${isAdmin ? `<td><button class="button button--danger" type="button" data-action="delete" data-key="${key}" data-id="${person.id}" aria-label="Xóa ${escapeHtml(person.name)}">Xóa</button></td>` : ''}</tr>`;
    }).join('');
    const columns = isAdmin ? 5 : 4;
    return `${pageHeading('Thành viên Minischool', title, description)}<section class="dashboard-card"><div class="dashboard-card__heading"><div><h3>${title}</h3><p>${people.length} hồ sơ mẫu</p></div></div>${form}<div class="table-wrap"><table class="data-table"><thead><tr><th scope="col">Họ và tên</th><th scope="col">Tài khoản</th><th scope="col">Email</th><th scope="col">${extraLabel}</th>${isAdmin ? '<th scope="col">Thao tác</th>' : ''}</tr></thead><tbody>${rows || `<tr><td class="table-empty" colspan="${columns}">Chưa có thành viên trong danh sách.</td></tr>`}</tbody></table></div></section>`;
  }

  function requestView() {
    const requests = data.requests;
    const rows = requests.map((request) => `<tr><td class="data-table__primary">${escapeHtml(request.name || request.user)}</td><td>${escapeHtml(request.user)}</td><td>${escapeHtml(request.email)}</td><td>${escapeHtml(request.phone)}</td><td><span class="status-pill">Chờ duyệt</span></td><td><button class="button" type="button" data-action="approve" data-id="${request.id}">Duyệt</button> <button class="button button--danger" type="button" data-action="deny" data-id="${request.id}">Từ chối</button></td></tr>`).join('');
    return `${pageHeading('Quản lý học viên', 'Yêu cầu đăng ký', 'Xem hồ sơ và xử lý yêu cầu tham gia trung tâm.')}
      <section class="dashboard-card"><div class="dashboard-card__heading"><div><h3>Đang chờ xử lý</h3><p>${requests.length} yêu cầu</p></div></div><div class="table-wrap"><table class="data-table"><thead><tr><th scope="col">Họ và tên</th><th scope="col">Tài khoản</th><th scope="col">Email</th><th scope="col">Điện thoại</th><th scope="col">Trạng thái</th><th scope="col">Thao tác</th></tr></thead><tbody>${rows || '<tr><td class="table-empty" colspan="6">Hiện chưa có yêu cầu đăng ký nào.</td></tr>'}</tbody></table></div></section>`;
  }

  function classDetailView() {
    const teacher = data.teachers[0] || {};
    return `${pageHeading('Lớp học của tôi', escapeHtml(profile.className || 'Lớp tiếng Anh A2'), 'Thông tin lớp học và lịch mẫu dành cho học viên.')}
      <section class="dashboard-card"><div class="dashboard-card__heading"><div><h3>Thông tin lớp</h3><p>Mã lớp · MS-A2-01</p></div><span class="status-pill">Đang học</span></div><div class="table-wrap"><table class="data-table"><tbody><tr><th scope="row">Giáo viên</th><td>${escapeHtml(teacher.name || 'Đang cập nhật')}</td></tr><tr><th scope="row">Thời lượng</th><td>12 tuần · 2 buổi mỗi tuần</td></tr><tr><th scope="row">Phòng học</th><td>Phòng 101 và 202</td></tr><tr><th scope="row">Mục tiêu</th><td>Phát triển từ vựng, nghe, nói, đọc và viết tiếng Anh</td></tr><tr><th scope="row">Học viên</th><td>${escapeHtml(displayName)} · ${escapeHtml(profile.memberId || '')}</td></tr></tbody></table></div></section>
      <section class="dashboard-card"><div class="dashboard-card__heading"><div><h3>Thời khóa biểu cá nhân</h3><p>Các ca học theo ngày trong tuần</p></div><a class="text-link" href="timetable.html">Mở thời khóa biểu</a></div>${schedule()}</section>`;
  }

  const pageViews = {
    dashboard: homeView,
    students: () => peopleView('students', role === 'admin' ? 'Danh sách học viên' : 'Học viên lớp tôi', role === 'admin' ? 'Hồ sơ mẫu, ảnh đại diện, mã học viên và lớp.' : 'Danh sách học viên trong các lớp được phân công.'),
    teachers: () => peopleView('teachers', 'Danh sách giáo viên', 'Hồ sơ, ảnh đại diện và môn phụ trách của giáo viên.'),
    requests: requestView,
    lessons: () => `${pageHeading('Giảng dạy', 'Thời khóa biểu', 'Lịch tuần mẫu của giáo viên Minischool.')}${schedule()}`,
    timetable: () => `${pageHeading('Học tập', 'Thời khóa biểu', `Lịch tuần mẫu của ${escapeHtml(displayName)}.`)}${schedule()}`,
    'class-detail': classDetailView
  };

  $('uname').textContent = displayName;
  $('urole').textContent = { admin: 'Quản trị viên', teacher: 'Giáo viên', student: 'Học viên' }[role];
  const avatar = document.querySelector('.account-avatar');
  if (avatar && profile.avatar) avatar.innerHTML = `<img src="${escapeHtml(profile.avatar)}" alt="Ảnh đại diện ${escapeHtml(displayName)}" width="40" height="40">`;
  $('menu').innerHTML = menus[role].map(([key, file, label]) => `<li><a href="${file}" class="${key === currentPage ? 'is-active' : ''}" ${key === currentPage ? 'aria-current="page"' : ''}>${label}</a></li>`).join('');
  $('view').innerHTML = pageViews[currentPage]();
  $('logout').addEventListener('click', () => {
    sessionStorage.removeItem('ms_user');
    location.href = '../login-register/login.html';
  });

  $('view').addEventListener('click', (event) => {
    const button = event.target.closest('[data-action]');
    if (!button || !isAdmin) return;
    const updatedData = db.get();
    const id = Number(button.dataset.id);
    if (button.dataset.action === 'delete') updatedData[button.dataset.key] = updatedData[button.dataset.key].filter((person) => person.id !== id);
    if (button.dataset.action === 'approve') {
      const request = updatedData.requests.find((item) => item.id === id);
      if (request) updatedData.students.push({ ...request, name: request.name || request.user, memberId: 'Chưa cấp mã', className: 'Chưa xếp lớp' });
    }
    if (button.dataset.action === 'approve' || button.dataset.action === 'deny') updatedData.requests = updatedData.requests.filter((item) => item.id !== id);
    db.save(updatedData);
    location.reload();
  });

  $('view').addEventListener('submit', (event) => {
    const form = event.target.closest('.inline-form');
    if (!form || !isAdmin) return;
    event.preventDefault();
    if (!form.reportValidity()) return;
    const fields = Object.fromEntries(new FormData(form));
    const updatedData = db.get();
    const duplicate = [updatedData.admin, ...updatedData.students, ...updatedData.teachers, ...updatedData.requests]
      .some((person) => person.user.toLowerCase() === fields.user.trim().toLowerCase());
    if (duplicate) {
      window.alert('Tên đăng nhập đã được sử dụng.');
      return;
    }
    updatedData[form.dataset.key].push({ id: Date.now(), ...fields, name: fields.name.trim(), user: fields.user.trim(), pass: '12345', avatar: '../assets/images/favicon/favicon-32x32.png' });
    db.save(updatedData);
    location.reload();
  });
}
