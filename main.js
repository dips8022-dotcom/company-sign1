class SignatureCard extends HTMLElement {
    constructor() {
        super();
        this.attachShadow({ mode: 'open' });
    }

    connectedCallback() {
        this.render();
    }

    render() {
        // 1. Clear previous content and get all attributes
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

        // 2. Build the final HTML string for the details section
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

        // 3. Set the complete innerHTML for the shadow DOM, including styles and structure
        this.shadowRoot.innerHTML = `
            <style>
                .signature { border: 1px solid #ccc; padding: 20px; border-radius: 10px; display: flex; gap: 20px; align-items: flex-start; box-shadow: 0 4px 8px rgba(0,0,0,0.1); background: #fff; }
                .profile-pic img { border-radius: 50%; width: 80px; height: 80px; }
                .details { font-size: 0.9rem; }
                .details p, .details h3, .details div { margin: 0; line-height: 1.5; }
                h3 { color: #000000; font-weight: bold;}
                .company-logo { margin-top: 8px; }
                .company-logo img { max-height: 60px; width: auto; }
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

        // 4. Add event listeners after the DOM has been created
        this.shadowRoot.querySelector('.copy-text').addEventListener('click', () => this.copyAsText());
        this.shadowRoot.querySelector('.copy-image').addEventListener('click', () => this.copyAsImage());
        this.shadowRoot.querySelector('.delete').addEventListener('click', () => this.remove());
    }

    copyAsText() {
        const signatureContent = this.shadowRoot.querySelector('#signature-content');
        if (signatureContent) {
            navigator.clipboard.write([new ClipboardItem({
                'text/html': new Blob([signatureContent.innerHTML], { type: 'text/html' })
            })]).then(() => {
                alert('서명이 텍스트로 복사되었습니다!');
            }).catch(err => {
                console.error('텍스트 복사 실패: ', err);
            });
        }
    }

    copyAsImage() {
        const signatureContent = this.shadowRoot.querySelector('#signature-content');
        if (signatureContent) {
             html2canvas(signatureContent).then(canvas => {
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
    
    // Use FormData to easily get all values
    const formData = new FormData(form);
    for (const [name, value] of formData.entries()) {
        newSignature.setAttribute(name, value);
    }

    preview.innerHTML = '';
    preview.appendChild(newSignature);
    form.reset();
});
