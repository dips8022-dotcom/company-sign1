class BusinessCard extends HTMLElement {
    constructor() {
        super();
        this.attachShadow({ mode: 'open' });
    }

    connectedCallback() {
        this.render();
    }

    static get observedAttributes() {
        return ['name', 'name-color', 'title', 'department', 'company', 'address', 'phone', 'personal-phone', 'email', 'website', 'profile-pic', 'company-logo', 'tagline-main', 'tagline-main-color', 'tagline-sub', 'tagline-sub-color', 'background-color'];
    }

    attributeChangedCallback(name, oldValue, newValue) {
        this.render();
    }

    render() {
        this.shadowRoot.innerHTML = '';
        const name = this.getAttribute('name');
        const nameColor = this.getAttribute('name-color');
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
        const taglineMain = this.getAttribute('tagline-main');
        const taglineMainColor = this.getAttribute('tagline-main-color');
        const taglineSub = this.getAttribute('tagline-sub');
        const taglineSubColor = this.getAttribute('tagline-sub-color');
        const backgroundColor = this.getAttribute('background-color');

        const profilePicHtml = profilePic ? `<div class="profile-pic"><img src="${profilePic}" alt="프로필" crossorigin="anonymous"></div>` : '';

        const taglineHtml = `
            <div class="tagline">
                <span class="tagline-main" style="color: ${taglineMainColor || '#ff0000'}">${taglineMain || ''}</span>
                <span class="tagline-sub" style="color: ${taglineSubColor || '#000000'}">${taglineSub || ''}</span>
            </div>
        `;

        let detailsHtml = '';
        if (name) {
            detailsHtml += `<h3 style="color: ${nameColor || '#000000'}">${name}</h3>`;
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
                .business-card {
                    border: 1px solid #ccc;
                    padding: 20px;
                    border-radius: 10px;
                    display: flex;
                    gap: 20px;
                    align-items: center;
                    box-shadow: 0 4px 8px rgba(0,0,0,0.1);
                    background: ${backgroundColor || '#ffffff'};
                    width: 100%;
                    max-width: 380px;
                    box-sizing: border-box;
                }
                .image-container { display: flex; flex-direction: column; gap: 5px; align-items: center; flex-shrink: 0; }
                .profile-pic img { border-radius: 50%; width: 80px; height: 80px; object-fit: cover; }
                .company-logo img { max-height: 23px; width: auto; max-width: 100%; }
                .details { font-family: sans-serif; font-size: 9pt; flex-grow: 1; overflow: hidden; }
                .info-block p, .details h3, .info-block div { margin: 0; line-height: 1.5; color: #000; word-break: break-all;}
                .details a { color: #000; text-decoration: none; }
                .details a:hover { text-decoration: underline; }
                h3 { font-weight: bold; font-size: 12pt; margin-bottom: 2px;}

                .tagline { text-align: right; margin-bottom: 5px; margin-top: 8px; white-space: nowrap; }
                .tagline-main, .tagline-sub { display: block; line-height: 1; }
                .tagline-main { font-weight: bold; font-size: 9pt; }
                .tagline-sub { font-size: 8pt; margin-top: 0px; }

                .actions { margin-top: 15px; display: flex; flex-wrap: wrap; gap: 10px; }
                button { padding: 8px 12px; border: none; border-radius: 5px; cursor: pointer; }
                .copy-text { background-color: #0078D4; color: white; }
                .copy-image { background-color: #28a745; color: white; }
                .download-jpg { background-color: #ffc107; color: black; }
                .delete { background-color: #dc3545; color: white; }

                @media (max-width: 400px) {
                    .business-card {
                        flex-direction: column;
                        text-align: center;
                    }
                    .image-container {
                        margin-bottom: 15px;
                    }
                    .details {
                        text-align: center;
                    }
                    .tagline {
                        text-align: right;
                        white-space: nowrap;
                    }
                }
            </style>

            <div class="business-card" id="business-card-content">
                <div class="image-container">
                    ${profilePicHtml}
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
                <button class="download-jpg">JPG로 다운로드</button>
                <button class="delete">삭제</button>
            </div>
        `;

        this.shadowRoot.querySelector('.copy-text').addEventListener('click', () => this.copyAsText());
        this.shadowRoot.querySelector('.copy-image').addEventListener('click', () => this.copyAsImage());
        this.shadowRoot.querySelector('.download-jpg').addEventListener('click', () => this.downloadAsJPG());
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
            
            navigator.clipboard.write([new ClipboardItem({ 'text/html': new Blob([htmlToCopy], { type: 'text/html' }) })]).then(() => {
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
                backgroundColor: this.getAttribute('background-color') || '#ffffff',
                useCORS: true,
                width: businessCardContent.offsetWidth,
                height: businessCardContent.offsetHeight,
                scale: 2
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
    
    downloadAsJPG() {
        const businessCardContent = this.shadowRoot.querySelector('#business-card-content');
        if (businessCardContent) {
            const options = {
                backgroundColor: this.getAttribute('background-color') || '#ffffff',
                useCORS: true,
                width: businessCardContent.offsetWidth,
                height: businessCardContent.offsetHeight,
                scale: 2
            };

             html2canvas(businessCardContent, options).then(canvas => {
                const link = document.createElement('a');
                link.href = canvas.toDataURL('image/jpeg', 0.9);
                link.download = 'business-card.jpg';
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
            });
        }
    }
}

customElements.define('business-card', BusinessCard);

const form = document.getElementById('business-card-form');
const preview = document.getElementById('business-card-preview');
const businessCard = preview.querySelector('business-card');

const updateCard = () => {
    const formData = new FormData(form);
    for (const [name, value] of formData.entries()) {
        if (name !== 'profile-pic' && name !== 'company-logo-input') {
            businessCard.setAttribute(name, value);
        }
    }

    const profilePicInput = document.getElementById('profile-pic');
    const profilePicFile = profilePicInput.files[0];
    if (profilePicFile) {
        const reader = new FileReader();
        reader.onload = (e) => {
            businessCard.setAttribute('profile-pic', e.target.result);
        };
        reader.readAsDataURL(profilePicFile);
    }

    const companyLogoInput = document.getElementById('company-logo-input');
    const companyLogoFile = companyLogoInput.files[0];
    if (companyLogoFile) {
        const reader = new FileReader();
        reader.onload = (e) => {
            businessCard.setAttribute('company-logo', e.target.result);
        };
        reader.readAsDataURL(companyLogoFile);
    }
};

form.addEventListener('input', updateCard);

form.addEventListener('submit', (e) => {
    e.preventDefault();
    const newCard = document.createElement('business-card');
    const oldCard = preview.querySelector('business-card');
    
    for (const attr of oldCard.attributes) {
        newCard.setAttribute(attr.name, attr.value);
    }

    preview.innerHTML = ''; 
    preview.appendChild(newCard);
});

document.querySelectorAll('.color-palette').forEach(palette => {
    palette.addEventListener('click', (e) => {
        if (e.target.classList.contains('color-swatch')) {
            const color = e.target.dataset.color;
            const targetInputId = e.currentTarget.dataset.for;
            const targetInput = document.getElementById(targetInputId);
            if (targetInput) {
                targetInput.value = color;
                updateCard();
            }
        }
    });
});
