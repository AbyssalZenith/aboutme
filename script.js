document.addEventListener('DOMContentLoaded', () => {
	const form = document.querySelector('.contact-form');
	if (!form) return;

	const patterns = {
		username: /^[A-Za-z]{3}\d{2}$/, // 3 letters then 2 digits
		password: /^(?=.*[A-Z])(?=.*[a-z])(?=.*\d)[A-Za-z\d]{6,8}$/ // 6-8, at least 1 upper, 1 lower, 1 digit
	};

	const minDate = new Date('2005-01-01');
	const maxDate = new Date('2015-12-31');

	function setError(el, msg){
		clearError(el);
		const p = document.createElement('p');
		p.className = 'field-error';
		p.textContent = msg;
		el.parentNode.insertBefore(p, el.nextSibling);
	}

	function clearError(el){
		const next = el.nextElementSibling;
		if (next && next.classList.contains('field-error')) next.remove();
	}

	// Remove any previous success message
	function clearSuccess(){
		const prev = form.querySelector('.field-success');
		if(prev) prev.remove();
	}

	form.addEventListener('submit', (e) => {
		e.preventDefault();
		clearSuccess();

		const usernameEl = document.getElementById('username');
		const passwordEl = document.getElementById('password');
		const dobEl = document.getElementById('dob');

		let valid = true;
		clearError(usernameEl);
		clearError(passwordEl);
		clearError(dobEl);

		// Username
		if (!patterns.username.test(usernameEl.value)){
			setError(usernameEl, 'Username must be 3 letters followed by 2 digits (exactly 5 chars). Example: Sam12');
			valid = false;
		}

		// Password
		if (!patterns.password.test(passwordEl.value)){
			setError(passwordEl, 'Password must be 6–8 characters, include uppercase, lowercase and a number; letters and digits only.');
			valid = false;
		}

		// DOB
		if (!dobEl.value){
			setError(dobEl, 'Please enter your date of birth.');
			valid = false;
		} else {
			const d = new Date(dobEl.value + 'T00:00:00');
			if (isNaN(d.getTime()) || d < minDate || d > maxDate){
				setError(dobEl, 'Date must be between 2005-01-01 and 2015-12-31.');
				valid = false;
			}
		}

		if (!valid){
			const first = form.querySelector('.field-error');
			if (first){
				const input = first.previousElementSibling;
				if (input && typeof input.focus === 'function') input.focus();
			}
			return;
		}

		// If valid: log the values (remove password logging in production)
		console.log('Form validated. Values:');
		console.log('username:', usernameEl.value);
		console.log('password:', passwordEl.value);
		console.log('dob:', dobEl.value);

		// Show a small success message
		const success = document.createElement('p');
		success.className = 'field-success';
		success.textContent = 'Form validated successfully. Values were logged to the console.';
		form.appendChild(success);

		// If you want to actually submit the form, uncomment the next line:
		// form.submit();
	});

		// ---- live requirement indicators ----
		const usernameEl = document.getElementById('username');
		const passwordEl = document.getElementById('password');
		const dobEl = document.getElementById('dob');

		function updateUsernameReqs(){
			const v = usernameEl.value || '';
			const exact = document.getElementById('u-exact');
			const first3 = document.getElementById('u-first3');
			const last2 = document.getElementById('u-last2');

			if (v.length === 5) exact.classList.replace('not-met','met'); else { exact.classList.replace('met','not-met'); }
			if (/^[A-Za-z]{0,3}/.test(v) && /^[A-Za-z]{3}/.test(v)) first3.classList.replace('not-met','met'); else { first3.classList.replace('met','not-met'); }
			if (/\d{2}$/.test(v)) last2.classList.replace('not-met','met'); else { last2.classList.replace('met','not-met'); }
		}

		function updatePasswordReqs(){
			const v = passwordEl.value || '';
			const up = document.getElementById('p-uppercase');
			const low = document.getElementById('p-lowercase');
			const dig = document.getElementById('p-digit');
			const len = document.getElementById('p-length');
			const chs = document.getElementById('p-chars');

			if (/[A-Z]/.test(v)) up.classList.replace('not-met','met'); else up.classList.replace('met','not-met');
			if (/[a-z]/.test(v)) low.classList.replace('not-met','met'); else low.classList.replace('met','not-met');
			if (/\d/.test(v)) dig.classList.replace('not-met','met'); else dig.classList.replace('met','not-met');
			if (v.length >=6 && v.length <=8) len.classList.replace('not-met','met'); else len.classList.replace('met','not-met');
			if (/^[A-Za-z\d]*$/.test(v)) chs.classList.replace('not-met','met'); else chs.classList.replace('met','not-met');
		}

		function updateDobReqs(){
			const v = dobEl.value;
			const dRange = document.getElementById('d-range');
			if (!v){ dRange.classList.replace('met','not-met'); return; }
			const d = new Date(v + 'T00:00:00');
			if (!isNaN(d.getTime()) && d >= minDate && d <= maxDate) dRange.classList.replace('not-met','met'); else dRange.classList.replace('met','not-met');
		}

		// safe-initialize classes (in case elements start with 'not-met')
		['u-exact','u-first3','u-last2','p-uppercase','p-lowercase','p-digit','p-length','p-chars','d-range'].forEach(id=>{
			const el = document.getElementById(id);
			if (el && !el.classList.contains('not-met') && !el.classList.contains('met')) el.classList.add('not-met');
		});

		usernameEl.addEventListener('input', updateUsernameReqs);
		passwordEl.addEventListener('input', updatePasswordReqs);
		dobEl.addEventListener('input', updateDobReqs);

		// run once to set initial states
		updateUsernameReqs(); updatePasswordReqs(); updateDobReqs();

		// image upload preview
		const imgInput = document.getElementById('image-upload');
		const previewContainer = document.getElementById('image-preview');
		let currentObjectUrl = null;

		function clearPreview(){
			if (currentObjectUrl){
				URL.revokeObjectURL(currentObjectUrl);
				currentObjectUrl = null;
			}
			const img = previewContainer.querySelector('img');
			if (img) img.remove();
			const placeholder = previewContainer.querySelector('.preview-placeholder');
			if (!placeholder){
				const span = document.createElement('span');
				span.className = 'preview-placeholder';
				span.textContent = 'No image selected';
				previewContainer.appendChild(span);
			}
		}

		function showPreview(file){
			clearPreview();
			if (!file) return;
			if (!file.type || !file.type.startsWith('image/')){
				// Not an image
				const span = document.createElement('span');
				span.className = 'preview-placeholder';
				span.textContent = 'Selected file is not an image';
				previewContainer.appendChild(span);
				return;
			}
			currentObjectUrl = URL.createObjectURL(file);
			const img = document.createElement('img');
			img.alt = 'Selected image preview';
			img.src = currentObjectUrl;
			previewContainer.appendChild(img);
		}

		if (imgInput && previewContainer){
			imgInput.addEventListener('change', (ev) => {
				const f = ev.target.files && ev.target.files[0];
				if (f) showPreview(f); else clearPreview();
			});
		}
});
