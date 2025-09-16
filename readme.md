# Note3 – Decentralized Markdown Notes

Note3 is a **decentralized Markdown note-taking platform** built on **Filecoin Onchain Cloud**.  
It is designed for **creators, developers, DAOs, and knowledge workers** who need notes that are **owned by the user, censorship-resistant, and verifiable**.  

Note3 aims to be the **Web3-native alternative** to Notion and Obsidian — combining Markdown flexibility with Filecoin's verifiable storage and monetization.

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

## 🚀 Quick Start

### Prerequisites

- Node.js 18+ 
- pnpm (recommended) or npm
- A Web3 wallet (MetaMask, WalletConnect, etc.)
- Filecoin Calibration testnet tokens for testing

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/your-username/note3.git
   cd note3
   ```

2. **Install dependencies**
   ```bash
   pnpm install
   ```

3. **Set up environment variables**
   ```bash
   cp apps/web/.env.example apps/web/.env.local
   ```
   
   Edit `apps/web/.env.local` and add your configuration:
   ```env
   NEXT_PUBLIC_WALLET_CONNECT_PROJECT_ID=your_wallet_connect_project_id_here
   NEXT_PUBLIC_FILECOIN_RPC_URL=https://api.calibration.node.glif.io/rpc/v1
   NEXT_PUBLIC_FILECOIN_NETWORK=testnet
   ```

4. **Start the development server**
   ```bash
   pnpm dev
   ```

5. **Open your browser**
   Navigate to [http://localhost:3000](http://localhost:3000)

---

## 🏗️ Project Structure

```
note3/
├── apps/
│   └── web/                    # Next.js frontend application
│       ├── app/                # App Router pages
│       │   ├── new/           # Create new note page
│       │   ├── edit/[id]/     # Edit note page
│       │   ├── note/[id]/     # View note page
│       │   └── test-upload/   # File upload testing page
│       ├── src/
│       │   ├── components/    # React components
│       │   ├── lib/          # Utility functions
│       │   └── wagmi.ts      # Wallet configuration
│       └── public/           # Static assets
├── packages/
│   ├── sdk/                  # Core SDK package
│   │   ├── src/
│   │   │   ├── hooks/        # React hooks
│   │   │   ├── providers/    # Context providers
│   │   │   ├── utils/        # Utility functions
│   │   │   └── storage.ts    # Filecoin storage integration
│   │   └── package.json
│   └── types/                # Shared TypeScript types
│       ├── src/
│       └── package.json
├── package.json              # Root package.json
├── turbo.json               # Turborepo configuration
└── README.md
```

---

## 🛠️ Tech Stack

### Frontend
- **Next.js 14** - React framework with App Router
- **TypeScript** - Type-safe JavaScript
- **Tailwind CSS** - Utility-first CSS framework
- **RainbowKit** - Wallet connection UI
- **Wagmi** - React hooks for Ethereum

### Blockchain & Storage
- **Filecoin Calibration** - Testnet for development
- **Synapse SDK** - Filecoin storage integration
- **WarmStorage** - Decentralized file storage
- **PDP (Proof of Data Possession)** - Storage verification

### Development Tools
- **Turborepo** - Monorepo build system
- **pnpm** - Fast, disk space efficient package manager
- **ESLint & Prettier** - Code quality and formatting

---

## 🚀 Deployment

### Vercel (Recommended)

1. **Fork the repository** on GitHub

2. **Connect to Vercel**
   - Go to [vercel.com](https://vercel.com)
   - Import your forked repository
   - Select the `apps/web` directory as the root

3. **Configure environment variables**
   In Vercel dashboard, add these environment variables:
   ```
   NEXT_PUBLIC_WALLET_CONNECT_PROJECT_ID=your_project_id
   NEXT_PUBLIC_FILECOIN_RPC_URL=https://api.calibration.node.glif.io/rpc/v1
   NEXT_PUBLIC_FILECOIN_NETWORK=testnet
   ```

4. **Deploy**
   - Vercel will automatically build and deploy
   - Your app will be available at `https://your-app.vercel.app`

### Manual Deployment

1. **Build the application**
   ```bash
   pnpm build
   ```

2. **Start the production server**
   ```bash
   pnpm start
   ```

3. **Configure your web server** (Nginx, Apache, etc.)
   - Serve the `apps/web/.next` directory
   - Ensure proper routing for Next.js


---

## 📖 Usage

### Creating Notes

1. **Connect your wallet** using the "Connect Wallet" button
2. **Click "New Note"** to create a new note
3. **Write your content** in Markdown format
4. **Add metadata** like title, category, and tags
5. **Save** - your note will be stored on Filecoin

### Viewing Notes

- **Browse all notes** on the home page
- **Search and filter** by category or tags
- **Click "View"** to read a note
- **Click "Edit"** to modify a note

### Features

- ✅ **Wallet Authentication** - No accounts needed
- ✅ **Markdown Editor** - Rich text editing
- ✅ **Decentralized Storage** - Notes stored on Filecoin
- ✅ **Search & Filter** - Find notes easily
- ✅ **Categories & Tags** - Organize your content
- ✅ **Responsive Design** - Works on all devices

---

## 🔧 Development

### Available Scripts

```bash
# Install dependencies
pnpm install

# Start development server
pnpm dev

# Build for production
pnpm build

# Start production server
pnpm start

# Run linting
pnpm lint

# Run type checking
pnpm type-check
```

---