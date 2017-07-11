
function getMobileOperatingSystem() {
	var userAgent = navigator.userAgent || navigator.vendor || window.opera;

	// Windows Phone must come first because its UA also contains "Android"
	if (/windows phone/i.test(userAgent)) {
		return "Windows Phone";
	}

	if (/android/i.test(userAgent)) {
		return "Android";
	}

	// iOS detection from: http://stackoverflow.com/a/9039885/177710
	if (/iPad|iPhone|iPod/.test(userAgent) && !window.MSStream) {
		return "iOS";
	}

	return "Personal Computer"; //Personal Computer
}

function parse_query_string(query) {
	var vars = query.split("&");
	var query_string = {};
	for (var i = 0; i < vars.length; i++) {
		var pair = vars[i].split("=");
		// If first entry with this name
		if (typeof query_string[pair[0]] === "undefined") {
			query_string[pair[0]] = decodeURIComponent(pair[1]);
			// If second entry with this name
		} else if (typeof query_string[pair[0]] === "string") {
			var arr = [query_string[pair[0]], decodeURIComponent(pair[1])];
			query_string[pair[0]] = arr;
			// If third or later entry with this name
		} else {
			query_string[pair[0]].push(decodeURIComponent(pair[1]));
		}
	}
	return query_string;
}

function generateLinks(params) {
	var operatingSystem = getMobileOperatingSystem();
	switch (operatingSystem) {
		case 'iOS':
			document.getElementById('googleStoreLink').style.display = 'none';
			document.getElementById('applicationLink').href = params['groupId'] ? `sesame://group/${params['groupId']}/${params['token']}` : `sesame://search/${params['token']}`;
			break;
		case 'Android':
			var groupIdParam = params['groupId'] ? `%26groupId%3D${params['groupId']}` : null;
			let url = `https://play.google.com/store/apps/details?id=com.open.sesame&referrer=token%3D${params['token']}`;
			if (groupIdParam) {
				url = url + groupIdParam;
			}
			window.location.replace(url);
			break;
		case 'Personal Computer':
			document.getElementById('applicationLink').style.display = 'none';
			break;
		default:
			document.getElementById('applicationLink').style.display = 'none';
			break;
	}
}

window.onload = function () {
	let query = window.location.search.substring(1);
	let params = parse_query_string(query);
	let xhttp = new XMLHttpRequest();
	xhttp.onreadystatechange = function() {
		if (this.readyState === 4 && this.status === 200) {
			if (!this.responseText) return;
			let responseText = JSON.parse(this.responseText);
			document.getElementById("senderNameFooter").innerHTML = responseText.senderName;
			document.getElementById("senderName").innerHTML = responseText.senderName;
			if (responseText.donationAmout) {
				document.getElementById("donationAmountValue").innerHTML = `$${responseText.donationAmout}`;
			} else {
				document.getElementById("donationAmountText").innerHTML = '';
			}
			if (responseText.searchTitle) {
				document.getElementById("itemTitle").innerHTML = responseText.searchTitle;
				document.getElementById("applicationLink").innerHTML = 'Go to searh';
			} else {
				document.getElementById("itemTitle").innerHTML = `Hi, please join the sesame group ${responseText.groupName}`;
				document.getElementById("applicationLink").innerHTML = 'Go to group';
			}
		}
	};
	xhttp.open("GET", `http://dev-backend.open-sesame-do-good.com/anon/invite?token=${params['token']}`, true);
	xhttp.send();
	generateLinks(params);
};