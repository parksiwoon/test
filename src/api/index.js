import mock from "./mock.json";
import { v4 as uuidv4 } from "uuid";
const { markets, communitys } = mock;
const API_BASE_URL = "http://localhost:4000"; // 실제 백엔드 API URL로 변경하세요.

function filterByKeyword(items, keyword) {
  const lowered = keyword.toLowerCase();
  return items.filter(({ title }) => title.toLowerCase().includes(lowered));
}

// 스마트팜 데이터 가져오기 함수 추가
export async function getSmartFarmData() {
  try {
    const response = await fetch(`${API_BASE_URL}/smartfarm`);
    if (!response.ok) {
      throw new Error("스마트팜 데이터를 가져올 수 없습니다.");
    }
    const data = await response.json();
    return data[0];
  } catch (error) {
    console.error("스마트팜 데이터를 가져오는 중 오류 발생:", error);
    return null;
  }
}

// 마켓 리스트 가져오기
export async function getMarkets(keyword) {
  try {
    const response = await fetch(`${API_BASE_URL}/markets`);
    const data = await response.json();

    if (keyword) {
      const lowered = keyword.toLowerCase();
      return data.filter(({ title }) => title.toLowerCase().includes(lowered));
    }

    return data;
  } catch (error) {
    console.error("마켓 데이터를 가져오는 중 오류 발생:", error);
    return [];
  }
}

// 특정 마켓 아이템 가져오기
export async function getMarketById(marketId) {
  try {
    const response = await fetch(`${API_BASE_URL}/markets/${marketId}`);
    if (!response.ok) {
      throw new Error("마켓 아이템을 가져올 수 없습니다.");
    }
    const market = await response.json();
    return market;
  } catch (error) {
    console.error("마켓 아이템을 가져오는 중 오류 발생:", error);
    return null;
  }
}

// 마켓 아이템 추가하기
export async function addMarket(marketData) {
  try {
    const response = await fetch(`${API_BASE_URL}/markets`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(marketData),
    });
    if (!response.ok) {
      throw new Error("마켓 아이템을 추가할 수 없습니다.");
    }
    const newMarket = await response.json();
    return newMarket;
  } catch (error) {
    console.error("마켓 아이템을 추가하는 중 오류 발생:", error);
    return null;
  }
}

// 마켓 아이템 삭제하기
export async function deleteMarket(id) {
  try {
    await fetch(`${API_BASE_URL}/markets/${id}`, {
      method: "DELETE",
    });
    return true;
  } catch (error) {
    console.error("마켓 아이템을 삭제하는 중 오류 발생:", error);
    return false;
  }
}

export function getMarketBySlug(marketSlug) {
  return markets.find((market) => market.slug === marketSlug);
}

// 커뮤니티 관련 함수들 (필요한 경우에만 수정)

export function getCommunitys(keyword) {
  if (!keyword) return communitys;
  return filterByKeyword(communitys, keyword);
}

export function getCommunityById(communityId) {
  const communitys = JSON.parse(localStorage.getItem("communitys")) || [];
  return communitys.find((community) => community.id === communityId);
}

// 새로운 기능 추가: 게시글 추가하기
export function addCommunity({ title, content, image, writer }) {
  // writer 객체 로그 확인
  console.log("addCommunity - writer:", writer);

  // writer 객체에서 user 정보 확인
  if (!writer || !writer.id) {
    throw new Error("로그인이 필요합니다."); // 로그인이 되어 있지 않으면 오류 발생
  }

  // 기존 communitys 데이터를 가져옴 (로컬 스토리지 또는 초기화)
  let communitys = JSON.parse(localStorage.getItem("communitys")) || [];

  // 로그 추가: 이미지 URL 확인
  console.log("addCommunity - 이미지 URL:", image);

  // 새로운 게시글 객체 생성
  const newCommunity = {
    id: uuidv4(), // UUID를 사용해 고유한 ID 생성
    title,
    content,
    image, // 이미지 URL 추가
    writer: {
      id: writer.id, // 작성자의 ID
      name: writer.name, // 작성자의 이름
      profile: { photo: writer.profile?.photo || "default_avatar.svg" }, // 프로필 사진 확인
    },
    createdAt: new Date().toISOString(),
    answers: [],
  };

  // communitys 배열 업데이트 로그
  console.log("Adding new community:", newCommunity);

  // 중복된 게시글이 있는지 확인 (ID뿐만 아니라 제목과 내용도 비교)
  const isDuplicate = communitys.some(
    (community) =>
      community.title === newCommunity.title &&
      community.content === newCommunity.content
  );

  if (isDuplicate) {
    console.warn("중복된 게시글이 발견되었습니다. 추가하지 않습니다.");
    return null; // 중복된 게시글이 있으면 추가하지 않음
  }

  // 기존 communitys에 새로운 게시글 추가
  communitys.unshift(newCommunity);

  // 저장된 데이터를 확인하는 로그 추가
  console.log("저장된 게시글들:", communitys);

  // 업데이트된 communitys를 로컬 스토리지에 저장
  localStorage.setItem("communitys", JSON.stringify(communitys));

  // 새로운 게시글 반환
  return newCommunity;
}

// 위시리스트 관련 함수들
const WISHLIST_KEY = "codethat-wishlist";

export function getWishlistSlugs() {
  const wishlist = JSON.parse(localStorage.getItem(WISHLIST_KEY) || "[]");
  return Array.isArray(wishlist) ? wishlist : [];
}

export function addWishlist(marketSlug) {
  if (!marketSlug) {
    console.error("유효하지 않은 marketSlug입니다:", marketSlug);
    return false;
  }

  const wishlist = getWishlistSlugs();

  if (!wishlist.includes(marketSlug)) {
    wishlist.push(marketSlug);
    localStorage.setItem(WISHLIST_KEY, JSON.stringify(wishlist));
    return true;
  }

  return false;
}

// 위시리스트에서 아이템 삭제
export function deleteWishlist(marketSlug) {
  let wishlist = getWishlistSlugs();
  wishlist = wishlist.filter((slug) => slug !== marketSlug);
  localStorage.setItem(WISHLIST_KEY, JSON.stringify(wishlist));
}
