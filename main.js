class BusinessCard extends HTMLElement {
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

        const taglineHtml = `
            <div class="tagline">
                <span class="tagline-main">Leading Technology Provider</span>
                <span class="tagline-sub">Since 1990</span>
            </div>
        `;

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

        this.shadowRoot.innerHTML = `
            <style>
                /* These styles will be included in the clipboard */
                .business-card { border: 1px solid #ccc; padding: 20px; border-radius: 10px; display: flex; gap: 20px; align-items: center; box-shadow: 0 4px 8px rgba(0,0,0,0.1); background: #fff; width: 360px; }
                .image-container { display: flex; flex-direction: column; gap: 5px; align-items: center; }
                .profile-pic img { border-radius: 50%; width: 80px; height: 80px; }
                .company-logo img { max-height: 23px; width: auto; }
                .details { font-family: sans-serif; font-size: 9pt; flex-grow: 1; }
                .info-block p, .details h3, .info-block div { margin: 0; line-height: 1.5; color: #000;}
                .details a { color: #000; text-decoration: none; }
                .details a:hover { text-decoration: underline; }
                h3 { color: #000000; font-weight: bold; font-size: 12pt; margin-bottom: 2px;}

                .tagline { text-align: right; margin-bottom: 5px; margin-top: -8px; }
                .tagline-main, .tagline-sub { display: block; line-height: 1; }
                .tagline-main { font-weight: bold; font-size: 9pt; color: red; }
                .tagline-sub { font-size: 8pt; color: black; margin-top: 0px; }

                /* These styles are for the buttons and won't be copied */
                .actions { margin-top: 15px; }
                button { padding: 8px 12px; border: none; border-radius: 5px; cursor: pointer; margin-right: 10px; }
                .copy-text { background-color: #0078D4; color: white; }
                .copy-image { background-color: #28a745; color: white; }
                .delete { background-color: #dc3545; color: white; }
            </style>

            <div class="business-card" id="business-card-content">
                <div class="image-container">
                    ${profilePic ? `<div class="profile-pic"><img src="${profilePic}" alt="프로필"></div>` : ''}
                    ${companyLogo ? `<div class="company-logo"><img src="${companyLogo}" alt="회사 로고"></div>` : ''}
                </div>
                <div class="details">
                    ${taglineHtml}
                    <div class="info-block">
                        ${detailsHtml}
                    </div>
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
        const businessCardContent = this.shadowRoot.querySelector('#business-card-content');
        const styleContent = this.shadowRoot.querySelector('style').innerHTML;

        if (businessCardContent) {
            const htmlToCopy = `
                <meta charset="UTF-8">
                <style>
                    ${styleContent}
                </style>
                ${businessCardContent.outerHTML}
            `;
            
            navigator.clipboard.write([new ClipboardItem({
                'text/html': new Blob([htmlToCopy], { type: 'text/html' })
            })]).then(() => {
                alert('명함이 서식과 함께 복사되었습니다!');
            }).catch(err => {
                console.error('HTML 명함 복사 실패: ', err);
                alert('오류: 명함 복사에 실패했습니다.');
            });
        }
    }

    copyAsImage() {
        const businessCardContent = this.shadowRoot.querySelector('#business-card-content');
        if (businessCardContent) {
             const options = {
                backgroundColor: '#ffffff'
             };

             html2canvas(businessCardContent, options).then(canvas => {
                canvas.toBlob(blob => {
                    if(blob) {
                        navigator.clipboard.write([new ClipboardItem({'image/png': blob})]).then(() => {
                            alert('명함이 이미지로 복사되었습니다!');
                        }).catch(err => {
                            console.error('이미지 복사 실패: ', err);
                        });
                    }
                });
            });
        }
    }
}

customElements.define('business-card', BusinessCard);

const form = document.getElementById('business-card-form');
const preview = document.getElementById('business-card-preview');

form.addEventListener('submit', (e) => {
    e.preventDefault();
    const newBusinessCard = document.createElement('business-card');
    const formData = new FormData(form);
    for (const [name, value] of formData.entries()) {
        newBusinessCard.setAttribute(name, value);
    }
    // Always use the local company logo
    newBusinessCard.setAttribute('company-logo', './company-logo.svg');

    preview.innerHTML = '';
    preview.appendChild(newBusinessCard);
    form.reset();
});
