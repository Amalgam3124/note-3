# Note3 – Decentralized Markdown Notes

Note3 is a **decentralized Markdown note-taking platform** built on **Filecoin Onchain Cloud**.  
It is designed for **creators, developers, DAOs, and knowledge workers** who need notes that are **owned by the user, censorship-resistant, and verifiable**.  

Note3 aims to be the **Web3-native alternative** to Notion and Obsidian — combining Markdown flexibility with Filecoin’s verifiable storage and monetization.

---

## Problem

### Centralized notes (Notion, Evernote)
- Notes live on company servers.  
- If the platform bans your account, changes terms, or shuts down, your notes vanish.  
- Privacy is controlled by providers, not users.  

### Local notes (Obsidian, Typora)
- Safe locally, but difficult to sync across devices.  
- Encrypted sync is especially hard.  
- Collaboration is limited or non-existent.  

### For creators, DAOs, and developers
- No reliable way to **prove authorship, timestamp, or ownership**.  
- DAO governance notes and proposals lack cryptographic guarantees.  
- Academic/research notes lack verifiable records.  

Users lack **ownership, portability, and verifiability** for notes.

---

## Solution

**Note3 = Notion + Obsidian + Filecoin**  

- **Decentralized storage**  
  Notes are saved on Filecoin WarmStorage — tamper-proof, censorship-resistant, and user-owned.  

- **Wallet login**  
  Identity and ownership are tied to user wallets. No extra accounts.  

- **Markdown editor**  
  Familiar and flexible. Great for developers, creators, and communities.  

- **On-chain verifiability**  
  PDP ensures notes still exist and are retrievable.  
  Notes can be timestamped and published with proofs of authorship.  

- **Optional monetization**  
  Using FilecoinPay, creators can make premium notes, subscriptions, or gated research papers.  

Note3 ensures **your notes remain yours, portable across devices, and cryptographically verifiable.**

---

## Technical Design

### System Flow
1. User logs in with wallet.  
2. Writes notes in Markdown editor.  
3. Notes stored on Filecoin WarmStorage.  
4. PDP validates persistence and existence.  
5. Notes accessed quickly via FilCDN.  
6. Optional monetization via FilecoinPay.  

### Stack
- **Frontend**: Next.js + RainbowKit + Tailwind  
- **Storage**: Filecoin WarmStorage Service  
- **Verification**: PDP contracts  
- **Payments**: FilecoinPay  
- **Distribution**: FilCDN  

---

## Market Opportunity

The note-taking market is enormous:
- Over **300M global users** on Notion, Evernote, Obsidian.  
- Rapid growth in **remote work, DAOs, and Web3 communities**.  

### Use Cases
- **Developer documentation** → stored with verifiable timestamps.  
- **DAO governance** → proposals, voting records, minutes.  
- **Personal/creative writing** → private yet portable knowledge base.  
- **Academic research** → timestamped proofs of authorship.  

---

## Roadmap

- **Wave 1 – Product Design**  
  - Submit design docs + Notion page  
  - Define problem, solution, architecture  

- **Wave 2 – MVP Build**  
  - Wallet login + Markdown editor + WarmStorage integration  
  - Basic storage & retrieval demo  
  - live demo

- **Wave 3 – Iteration & Features**  
  - Add images, tags, categories  
  - Integrate FilecoinPay for premium notes/subscriptions  
  - Improve UX & retrieval speed with FilCDN  

- **Wave 4 – Final Product**  
  - Full-featured decentralized note app 
  - Public note directory + verifiable PDP proofs
  - Final demo

---

## Filecoin Integration

Note3 leverages Filecoin Onchain Cloud to the fullest:
- **WarmStorage + PDP** → Notes remain verifiable and censorship-resistant  
- **FilecoinPay** → Premium/gated access for creators and DAOs  
- **FilCDN** → Smooth multi-device access  

---
