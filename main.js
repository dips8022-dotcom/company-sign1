class SignatureCard extends HTMLElement {
    constructor() {
        super();
        this.attachShadow({ mode: 'open' });
    }

    connectedCallback() {
        this.render();
    }

    render() {
        this.shadowRoot.innerHTML = '';
        const name = this.getAttribute('name');
        const title = this.getAttribute('title');
        const department = this.getAttribute('department');
        const company = this.getAttribute('company');
        const address = this.getAttribute('address');
        const phone = this.getAttribute('phone');
        const personalPhone = this.getAttribute('personal-phone');
        const email = this.getAttribute('email');
        const website = this.getAttribute('website');
        const profilePic = this.getAttribute('profile-pic');
        const companyLogo = this.getAttribute('company-logo');

        let detailsHtml = '';
        if (name) {
            detailsHtml += `<h3>${name}</h3>`;
        }
        if (title || department) {
            detailsHtml += `<p>${title || ''}${title && department ? ' | ' : ''}${department || ''}</p>`;
        }
        if (company) {
            detailsHtml += `<p><strong>${company}</strong></p>`;
        }
        if (address) {
            detailsHtml += `<p>${address}</p>`;
        }
        const contactParts = [];
        if (phone) contactParts.push(`P: ${phone}`);
        if (personalPhone) contactParts.push(`M: ${personalPhone}`);
        if (contactParts.length > 0) {
            detailsHtml += `<p>${contactParts.join(' | ')}</p>`;
        }
        const webParts = [];
        if (email) webParts.push(`E: <a href="mailto:${email}">${email}</a>`);
        if (website) webParts.push(`<a href="${website}" target="_blank">${website}</a>`);
        if (webParts.length > 0) {
            detailsHtml += `<p>${webParts.join(' | ')}</p>`;
        }
        if (companyLogo) {
            detailsHtml += `<div class="company-logo"><img src="${companyLogo}" alt="회사 로고"></div>`;
        }

        this.shadowRoot.innerHTML = `
            <style>
                /* These styles will be included in the clipboard */
                .signature { border: 1px solid #ccc; padding: 20px; border-radius: 10px; display: flex; gap: 20px; align-items: flex-start; box-shadow: 0 4px 8px rgba(0,0,0,0.1); background: #fff; width: fit-content; }
                .profile-pic img { border-radius: 50%; width: 80px; height: 80px; }
                .details { font-family: sans-serif; font-size: 9pt; }
                .details p, .details h3, .details div { margin: 0; line-height: 1.5; color: #000;}
                .details a { color: #000; text-decoration: none; }
                .details a:hover { text-decoration: underline; }
                h3 { color: #000000; font-weight: bold; font-size: 11pt; margin-bottom: 2px;}
                .company-logo { margin-top: 8px; }
                .company-logo img { max-height: 23px; width: auto; }

                /* These styles are for the buttons and won't be copied */
                .actions { margin-top: 15px; }
                button { padding: 8px 12px; border: none; border-radius: 5px; cursor: pointer; margin-right: 10px; }
                .copy-text { background-color: #0078D4; color: white; }
                .copy-image { background-color: #28a745; color: white; }
                .delete { background-color: #dc3545; color: white; }
            </style>

            <div class="signature" id="signature-content">
                ${profilePic ? `<div class="profile-pic"><img src="${profilePic}" alt="프로필"></div>` : ''}
                <div class="details">
                    ${detailsHtml}
                </div>
            </div>

            <div class="actions">
                <button class="copy-text">텍스트로 복사</button>
                <button class="copy-image">이미지로 복사</button>
                <button class="delete">삭제</button>
            </div>
        `;

        this.shadowRoot.querySelector('.copy-text').addEventListener('click', () => this.copyAsText());
        this.shadowRoot.querySelector('.copy-image').addEventListener('click', () => this.copyAsImage());
        this.shadowRoot.querySelector('.delete').addEventListener('click', () => this.remove());
    }

    copyAsText() {
        const signatureContent = this.shadowRoot.querySelector('#signature-content');
        const styleContent = this.shadowRoot.querySelector('style').innerHTML;

        if (signatureContent) {
            const htmlToCopy = `
                <meta charset="UTF-8">
                <style>
                    ${styleContent}
                </style>
                ${signatureContent.outerHTML}
            `;
            
            navigator.clipboard.write([new ClipboardItem({
                'text/html': new Blob([htmlToCopy], { type: 'text/html' })
            })]).then(() => {
                alert('서명이 서식과 함께 복사되었습니다!');
            }).catch(err => {
                console.error('HTML 서식 복사 실패: ', err);
                alert('오류: 서식 복사에 실패했습니다.');
            });
        }
    }

    copyAsImage() {
        const signatureContent = this.shadowRoot.querySelector('#signature-content');
        if (signatureContent) {
             const options = {
                backgroundColor: '#ffffff'
             };

             html2canvas(signatureContent, options).then(canvas => {
                canvas.toBlob(blob => {
                    if(blob) {
                        navigator.clipboard.write([new ClipboardItem({'image/png': blob})]).then(() => {
                            alert('서명이 이미지로 복사되었습니다!');
                        }).catch(err => {
                            console.error('이미지 복사 실패: ', err);
                        });
                    }
                });
            });
        }
    }
}

customElements.define('signature-card', SignatureCard);

const form = document.getElementById('signature-form');
const preview = document.getElementById('signature-preview');

form.addEventListener('submit', (e) => {
    e.preventDefault();
    const newSignature = document.createElement('signature-card');
    const formData = new FormData(form);
    for (const [name, value] of formData.entries()) {
        newSignature.setAttribute(name, value);
    }
    // Always use the local company logo
    newSignature.setAttribute('company-logo', './company-logo.svg');

    preview.innerHTML = '';
    preview.appendChild(newSignature);
    form.reset();
});
