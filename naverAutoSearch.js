
// 네이버 연관검색어 자동 수행

// 최초작성: 2018-10-03 by 닥터마시리트
// 사용예) @JS(https://cdn.rawgit.com/Dr-Mashirito/sming/master/naverAutoSearch.js){ "검색어세트들": [ ["홍길동", "홍길동 아빠"], ["홍길동", "홍길동 엄마"] ] }

async function main(arg) {

	var 검색어세트들 = arg.검색어세트들;	// 검색어세트가 여러개 담긴 배열

	// jquery 로드
	await sming.loadScript('https://code.jquery.com/jquery-latest.min.js');

	// 컨테이너 div 등록
	var $container = $('<div />').css({
		width: '840px',
		overflowX: 'hidden',
		display: 'inline-block'
	});
	$('body').css({ margin: 0, padding: 0 }).append($container);

	// 검색어세트들 순회
	for (var i = 0; i < 검색어세트들.length; i++) {

		var 검색어세트 = 검색어세트들[i];	// 연관 검색어 세트. 예) ['홍길동', '홍길동 아빠']

		// 검색을 수행하고 스크린샷 파일명 3개를 받아온다
		var 임시스샷3개 = await do검색(검색어세트);

		// 임시스샷으로 div 만들기
		var $div = $('<div style="width:840px; position: relative;">'
			+ '<img src="' + 임시스샷3개[0] + '" width="280" height="500" />'
			+ '<img src="' + 임시스샷3개[1] + '" width="280" height="500" />'
			+ '<img src="' + 임시스샷3개[2] + '" width="280" height="500" />'
			+ '</div>'
		);

		// 낙관이 있다면 div에 불러오기
		var stampFile = await sming.getStampImageFileName();
		if (stampFile) {
			var $stamp = $('<div />').css({
				position: 'absolute',
				top: 0,
				left: 0,
				width: '100%',
				height: '100%',
				display: 'flex',
				justifyContent: 'center',
				alignItems: 'center',
				opacity: 0.5,
				zIndex: 9
			});
			$stamp.append('<img src="' + stampFile + '" />')
			$stamp.appendTo($div);
		}

		// 이 div를 화면에 표시
		$container.append($div);
	}

	// 통합화면 스샷을 저장
	var finalImageFile = await sming.saveElement($container[0]);

	// 통합화면 스샷 파일명 리턴
	return finalImageFile;
}


// 네이버 검색 수행 함수
async function do검색(검색어세트) {

	var 임시스샷3개 = [];

	// 네이버창 열기
	var 네이버창 = window.open("https://m.naver.com", "winNaver", "width=360,height=640,resizable");
	await sming.waitEvent(네이버창, 'load');
	await sming.wait(500);

	// 검색어들을 차례대로 수행
	for (var i = 0; i < 검색어세트.length; i++) {

		// 검색입력칸 찾아서 포커스
		var 검색칸 = $(네이버창.document).find('#query')[0];
		if (!검색칸) 검색칸 = $(네이버창.document).find('#nx_query')[0];
		검색칸.click();
		검색칸.focus();
		await sming.wait(500);

		// 검색어 입력
		검색칸.value = 검색어세트[i];
		검색칸.dispatchEvent(new Event("input"));
		await sming.wait(500);

		// 검색버튼 클릭
		var 검색버튼 = $(네이버창.document).find('form[name="search"] button[type=submit]')[0];
		검색버튼.click();
		await sming.wait(1000);

		// 스크린샷
		if (i == 0) {
			var 스샷파일명 = await sming.saveScreenshot("winNaver");		// 임시스샷 저장 1
			임시스샷3개.push(스샷파일명);
		} else if (i == 검색어세트.length - 1) {
			var 스샷파일명 = await sming.saveScreenshot("winNaver");		// 임시스샷 저장 2
			임시스샷3개.push(스샷파일명);

			// 클릭가능한 링크들 수집
			var links = { length: 0 };

			if (links.length == 0)
				links = $(네이버창.document).find(
					'section.sp_nreview ul.lst_total > li a[href*="blog.naver.com"],'
					+ 'section.sp_nreview ul.lst_total > li a[href*="cafe.naver.com"]'
				);

			if (links.length == 0)
				links = $(네이버창.document).find(
					'ul.lst_total > li a[href*="blog.naver.com"],'
					+ 'ul.lst_total > li a[href*="cafe.naver.com"]'
				);

			if (links.length == 0)
				links = $(네이버창.document).find(
					'li a[href*="blog.naver.com"],'
					+ 'li a[href*="cafe.naver.com"]'
				);

			if (links.length == 0) throw '클릭할 수 있는 링크가 없습니다! (검색어: ' + 검색어세트[i] + ')';

			// 랜덤 게시물 클릭
			var sel = Math.floor((Math.random() * links.length));
			links[sel].click();
			await sming.wait(2000);

			var 스샷파일명 = await sming.saveScreenshot("winNaver");		// 임시스샷 저장 3
			임시스샷3개.push(스샷파일명);
		}
	}

	// 네이버창 닫기
	네이버창.close();

	return 임시스샷3개;
}
