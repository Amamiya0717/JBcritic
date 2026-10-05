// 자동입력에 쓰는 외부 서비스의 출처 표기 (TMDB, RAWG는 이용 조건으로 요구함).
export default function SiteFooter() {
  return (
    <footer className="site-footer">
      <p>
        작품 정보 출처:{" "}
        <a href="https://www.themoviedb.org/" target="_blank" rel="noreferrer">
          TMDB
        </a>
        {" · "}
        <a href="https://rawg.io/" target="_blank" rel="noreferrer">
          RAWG
        </a>
        {" · "}
        <a href="https://anilist.co/" target="_blank" rel="noreferrer">
          AniList
        </a>
        {" · "}
        <a href="https://www.apple.com/itunes/" target="_blank" rel="noreferrer">
          iTunes
        </a>
      </p>
      <p>
        This product uses the TMDB API but is not endorsed or certified by TMDB.
      </p>
    </footer>
  );
}
