class SignatureCard extends HTMLElement {
    constructor() {
        super();
        this.attachShadow({ mode: 'open' });
    }

    connectedCallback() {
        this.render();
        this.shadowRoot.querySelector('.copy-text').addEventListener('click', () => this.copyAsText());
        this.shadowRoot.querySelector('.copy-image').addEventListener('click', () => this.copyAsImage());
        this.shadowRoot.querySelector('.delete').addEventListener('click', () => this.remove());
    }

    render() {
        const name = this.getAttribute('name');
        const title = this.getAttribute('title');
        const department = this.getAttribute('department');
        const company = this.getAttribute('company');
        const phone = this.getAttribute('phone');
        const email = this.getAttribute('email');
        const website = this.getAttribute('website');
        const profilePic = this.getAttribute('profile-pic');
        const companyLogo = this.getAttribute('company-logo');

        this.shadowRoot.innerHTML = `
            <style>
                .signature {
                    border: 1px solid #ccc;
                    padding: 20px;
                    border-radius: 10px;
                    display: flex;
                    gap: 20px;
                    align-items: center;
                    box-shadow: 0 4px 8px rgba(0,0,0,0.1);
                    background: #fff;
                }
                .profile-pic img {
                    border-radius: 50%;
                    width: 80px;
                    height: 80px;
                }
                .details {
                    font-size: 0.9rem;
                }
                .details p {
                    margin: 2px 0;
                    line-height: 1.2;
                }
                h3 {
                    margin: 0;
                    color: #000000;
                }
                .company-logo {
                    margin-top: 10px;
                }
                .company-logo img {
                    max-height: 60px;
                    width: auto;
                }
                .actions {
                    margin-top: 15px;
                }
                button {
                    padding: 8px 12px;
                    border: none;
                    border-radius: 5px;
                    cursor: pointer;
                    margin-right: 10px;
                }
                .copy-text { background-color: #0078D4; color: white; }
                .copy-image { background-color: #28a745; color: white; }
                .delete { background-color: #dc3545; color: white; }
            </style>
            <div class="signature" id="signature-content">
                ${profilePic ? `<div class="profile-pic"><img src="${profilePic}" alt="Profile"></div>` : ''}
                <div class="details">
                    <h3>${name}</h3>
                    <p>${title}${department ? ` | ${department}` : ''}</p>
                    <p><strong>${company}</strong></p>
                    <p>${phone ? `P: ${phone}` : ''}</p>
                    <p>${email ? `E: <a href="mailto:${email}">${email}</a>` : ''}</p>
                    <p>${website ? `<a href="${website}">${website}</a>` : ''}</p>
                    ${companyLogo ? `<div class="company-logo"><img src="${companyLogo}" alt="Company Logo"></div>` : ''}
                </div>
            </div>
            <div class="actions">
                <button class="copy-text">Copy as Text</button>
                <button class="copy-image">Copy as Image</button>
                <button class="delete">Delete</button>
            </div>
        `;
    }

    copyAsText() {
        const signatureContent = this.shadowRoot.querySelector('#signature-content').innerHTML;
        navigator.clipboard.write([new ClipboardItem({
            'text/html': new Blob([signatureContent], { type: 'text/html' })
        })]).then(() => {
            alert('Signature copied as text!');
        }).catch(err => {
            console.error('Failed to copy text: ', err);
        });
    }

    copyAsImage() {
        const signatureContent = this.shadowRoot.querySelector('#signature-content');
        html2canvas(signatureContent).then(canvas => {
            canvas.toBlob(blob => {
                navigator.clipboard.write([new ClipboardItem({'image/png': blob})]).then(() => {
                    alert('Signature copied as image!');
                }).catch(err => {
                    console.error('Failed to copy image: ', err);
                });
            });
        });
    }
}

customElements.define('signature-card', SignatureCard);

const form = document.getElementById('signature-form');
const preview = document.getElementById('signature-preview');

form.addEventListener('submit', (e) => {
    e.preventDefault();
    const newSignature = document.createElement('signature-card');
    newSignature.setAttribute('name', document.getElementById('name').value);
    newSignature.setAttribute('title', document.getElementById('title').value);
    newSignature.setAttribute('department', document.getElementById('department').value);
    newSignature.setAttribute('company', document.getElementById('company').value);
    newSignature.setAttribute('phone', document.getElementById('phone').value);
    newSignature.setAttribute('email', document.getElementById('email').value);
    newSignature.setAttribute('website', document.getElementById('website').value);
    newSignature.setAttribute('profile-pic', document.getElementById('profile-pic').value);
    newSignature.setAttribute('company-logo', document.getElementById('company-logo').value);
    preview.appendChild(newSignature);
    form.reset();
});
