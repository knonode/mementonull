<script lang="ts">
  export let isOpen = false;
  export let onClose: () => void;
</script>

<div 
  class="overlay" 
  class:open={isOpen} 
  on:click|self={onClose}
  on:keydown={e => e.key === 'Escape' && onClose()}
  role="dialog"
  aria-modal="true"
>
  <div class="content terminal-text">
    <h2>Memento Mori World Population Simulator</h2>
    <p>
        This is a world's first on-chain population simulator.
        Circulating supply is the current population number.
        Every hour newborn people minus deceased are added to circulating supply, 
        following a curve based on United Nations Population Division data 
        projections.
    </p>
    <p>
        The reserve account is funded to run until year 2100 or until 
        reaching total supply or in case fee structure changes on Algorand protocol.
    </p>
    <p>
        A philosophical discussion conceived as an Algorand ASA with a 
        fluctuating circulating supply pegged to the amount of people living on 
        planet Earth at present time.
    </p> 
    <p>
        The project, being built on Algorand and 
        closely tied to the monetary system as such, asks questions about the 
        worth of a human life. One $MEMO represents one living human, and in 
        principle every human being on the planet and orbiting it, is accredited 
        with one $MEMO.
    </p>
    <p>
        This token will never be made available 
        for trading and is made only for educational and and entertainment purposes.
        It has freeze and clawback enabled to keep options for further development open.
    </p>
    <p>
      <strong>$MORI creator account:</strong><br />
      <span class="account-address">DEAXD24NWYIBUKALDZEMEMZCM6D4ANNTDB2VUKXOH3YO3SUONGZSXQZLGU</span>
    </p>
    <p>
      <strong>$MORI reserve account:</strong><br />
      <span class="account-address">LOGOSKGASR2WUTFBRQQSGOJT7QBXWQV7HWGTLYRBVGLJQFVLH2BR5NGQZQ</span>
    </p>
    <p>
      <strong>$MORI receiver account aka mementomori.algo:</strong><br />
      <span class="account-address">ORBISXYDPXH4MGICPYHQLLSHH7IYMXECPJIG5N5M3GMKZ7MHRLBFHZLOFE</span>
    </p>
    <p>
        Idea by Hampelman, token script and population data curve by RunVnc.
        Special thanks to Null for ragdoll physics and website prototype.
    </p>
    <button 
      class="close-btn" 
      on:click={onClose} 
      on:keydown={e => e.key === 'Enter' && onClose()}
    >×</button>
  </div>
</div>

<style lang="scss">
  .overlay {
    display: none;
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: rgba(0, 0, 0, 0.5);
    z-index: 1000;
    overflow-y: auto;
    
    &.open {
      display: flex;
      align-items: flex-start;
      justify-content: center;
      padding: 1rem 0;
    }
  }

  .content {
    background: #fdf6e3;
    color: #000;
    padding: 2rem;
    max-width: 500px;
    width: 90%;
    margin: 1rem;
    border: 1px solid #000;
    position: relative;
    box-sizing: border-box;
    
    p {
      margin-bottom: 1rem;
    }

    .account-address {
      word-break: break-all;
      overflow-wrap: break-word;
    }
    
    @media (max-width: 480px) {
      padding: 1.5rem;
      margin: 0.5rem;
      width: 95%;
      
      h2 {
        font-size: 1.5rem;
        margin-bottom: 1rem;
      }
      
      p {
        font-size: 0.9rem;
      }
    }
  }

  .close-btn {
    position: absolute;
    top: 1rem;
    right: 1rem;
    background: none;
    border: none;
    color: #000;
    font-size: 1.5rem;
    cursor: pointer;
    
    &:hover {
      color: #333;
    }
  }
</style>
