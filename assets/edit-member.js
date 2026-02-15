// ./assets/member-edit.js
const API_BASE2 = API_HOST.MEMBER;

// ✅ (1) 내 정보 조회 API: 너 프로젝트에 맞게 여기만 바꾸면 됨
// 후보: /api/member/me  OR  /api/auth/check-session  OR  /api/member/myProfile
const PROFILE_URL = `${API_BASE2}/api/member/me`;

// ✅ (2) 회원 수정 API: 네가 이미 쓰는 엔드포인트
const UPDATE_URL = `${API_BASE2}/api/member/editMember`;

// ✅ (3) 로그아웃 API (세션 invalidate)
const LOGOUT_URL = `${API_HOST.AUTH}/api/auth/logout`;


document.addEventListener("DOMContentLoaded", () => {
  loadMyProfile();
});

function setMsg(text, ok = false) {
  const el = document.getElementById("msg");
  el.style.color = ok ? "#166534" : "#b91c1c";
  el.textContent = text ?? "";
}

async function loadMyProfile() {
  try {
    const res = await fetch(PROFILE_URL, {
      method: "GET",
      credentials: "include", // ★ 세션 쿠키 포함
    });

    if (res.status === 401) {
      setMsg("로그인이 필요합니다.");
      return;
    }
    if (!res.ok) {
      setMsg("프로필 조회 실패");
      return;
    }

    const json = await res.json().catch(() => ({}));
    const p = json?.data ?? json; // {data:{...}} 또는 {...} 둘 다 대응

    // 응답에 없는 건 그냥 비워둠
    if (p.id != null) document.getElementById("id").value = p.id;
    if (p.username != null) document.getElementById("username").value = p.username;

    // 너 ResponseDTO에 email이 없을 수도 있음 → 있으면 채우고 없으면 빈칸
    if (p.email != null) document.getElementById("email").value = p.email;

    if (p.mobile != null) document.getElementById("mobile").value = p.mobile;
    if (p.dept != null) document.getElementById("dept").value = p.dept;
    if (p.position != null) document.getElementById("position").value = p.position;

    setMsg("");
  } catch (e) {
    console.error(e);
    setMsg("프로필 조회 중 오류");
  }
}

// HTML의 oninput="pwCheck()" 때문에 window에 노출
window.pwCheck = function pwCheck() {
  const pw = document.getElementById("newPw").value;
  const cf = document.getElementById("newConfirm").value;
  const label = document.getElementById("pwLabel");

  if (!pw && !cf) {
    label.textContent = "";
    label.className = "help";
    return;
  }
  if (pw && cf && pw === cf) {
    label.textContent = "비밀번호가 일치합니다.";
    label.className = "help ok";
  } else {
    label.textContent = "비밀번호가 일치하지 않습니다.";
    label.className = "help bad";
  }
};

window.goBack = function goBack() {
  history.back();
};

window.submitUpdate = async function submitUpdate() {
  setMsg("");

  const mobile = document.getElementById("mobile").value.trim();
  const dept = document.getElementById("dept").value.trim();
  const position = document.getElementById("position").value.trim();

  const newPw = document.getElementById("newPw").value;
  const newConfirm = document.getElementById("newConfirm").value;

  // required 방어
  if (!mobile || !dept || !position) {
    setMsg("전화번호/부서/직급을 입력하세요.");
    return;
  }

  // ✅ 백엔드 MemberDTO에 맞춰 payload 구성 (id는 안 보냄)
  const payload = { mobile, dept, position };

  // ✅ 화면 필드(newPw/newConfirm) → 백엔드 필드(pw/confirm)로 매핑
  if (newPw.trim().length > 0) {
    if (newPw !== newConfirm) {
      setMsg("새 비밀번호 확인이 일치하지 않습니다.");
      return;
    }
    payload.pw = newPw;
    payload.confirm = newConfirm;
  }

  try {
    const res = await fetch(UPDATE_URL, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
      credentials: "include", // ★ 세션 쿠키 포함
    });

    const body = await res.json().catch(() => ({}));

    if (res.status === 401) {
      setMsg(body?.message ?? "로그인이 필요합니다.");
      return;
    }
    if (!res.ok) {
      setMsg(body?.message ?? "회원 수정 실패");
      return;
    }

  // 1) 수정 성공 → 바로 로그아웃 호출
await fetch(LOGOUT_URL, {
  method: "POST",
  credentials: "include",
}).catch(() => {}); // 로그아웃 실패해도 UX는 진행

// 2) 문구 표시(페이지 내) + 팝업
setMsg("회원정보가 수정되어 로그아웃되었습니다.", true);
alert("회원정보가 수정되어 로그아웃되었습니다.");

// 3) 선택: 로그인 페이지로 이동(원하면 경로만 맞추기)
location.href = "/auth/login.html";

  } catch (e) {
    console.error(e);
    setMsg("요청 중 오류");
  }
};
