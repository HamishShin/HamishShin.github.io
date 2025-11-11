// BlackJack Game for Header
(function(){
  'use strict';
  
  if(!document.getElementById('blackjack-game')) return;
  
  // Game state
  var cards = ['A','K','Q','J',10,9,8,7,6,5,4,3,2];
  var playerHand = [];
  var dealerHand = [];
  var gameActive = false;
  var wallet = 100;
  var currentBet = 0;
  
  // DOM elements
  var hitBtn = document.getElementById('bj-hit');
  var standBtn = document.getElementById('bj-stand');
  var newGameBtn = document.getElementById('bj-new-game');
  var resetBtn = document.getElementById('bj-reset');
  var walletEl = document.getElementById('bj-wallet');
  var betSelect = document.getElementById('bj-bet-amount');
  var gameContainer = document.getElementById('blackjack-game');
  var playerCardsEl = document.getElementById('bj-player-cards');
  var dealerCardsEl = document.getElementById('bj-dealer-cards');
  
  // Display cards
  function displayCards(hand, container, hideSecond){
    if(!container) return;
    container.innerHTML = '';
    
    for(var i = 0; i < hand.length; i++){
      var cardEl = document.createElement('div');
      cardEl.className = 'bj-card';
      
      if(i === 1 && hideSecond){
        cardEl.classList.add('hidden');
        cardEl.textContent = '?';
      } else {
        cardEl.textContent = hand[i];
      }
      
      container.appendChild(cardEl);
      
      // Animate card appearance
      if(typeof window.gsap !== 'undefined' && !hideSecond){
        var gs = window.gsap;
        gs.from(cardEl, {opacity: 0, scale: 0.5, duration: 0.3, delay: i * 0.1});
      }
    }
  }
  
  // Calculate hand total
  function calculateTotal(hand){
    var total = 0;
    var aceCount = 0;
    
    for(var i = 0; i < hand.length; i++){
      var card = hand[i];
      if(card === 'A'){
        aceCount++;
        total += 11;
      } else if(card === 'K' || card === 'Q' || card === 'J'){
        total += 10;
      } else {
        total += card;
      }
    }
    
    // Adjust for aces if over 21
    while(total > 21 && aceCount > 0){
      total -= 10;
      aceCount--;
    }
    
    return total;
  }
  
  // Animate button press
  function animateButton(btn){
    if(typeof window.gsap !== 'undefined'){
      var gs = window.gsap;
      gs.to(btn, {scale: 0.95, duration: 0.1, yoyo: true, repeat: 1});
    }
  }
  
  // Update wallet display
  function updateWallet(value){
    wallet += value;
    if(walletEl){
      // Animate wallet change
      if(typeof window.gsap !== 'undefined'){
        var gs = window.gsap;
        gs.to(walletEl, {scale: 1.2, color: value > 0 ? '#87FF65' : '#FF6B65', duration: 0.2, yoyo: true, repeat: 1});
      }
      walletEl.textContent = wallet;
    }
    
    // Check for game over
    if(wallet <= 0){
      setTimeout(function(){
        showMessage('GAME OVER!', 3000);
        disableGame();
      }, 500);
    }
  }
  
  // Disable game
  function disableGame(){
    gameActive = false;
    if(hitBtn) hitBtn.disabled = true;
    if(standBtn) standBtn.disabled = true;
    if(newGameBtn) newGameBtn.disabled = true;
    if(betSelect) betSelect.disabled = true;
  }
  
  // Start new game
  function newGame(){
    if(wallet <= 0){
      return;
    }
    
    // Get bet amount
    currentBet = parseInt(betSelect.value);
    
    // Validate bet amount
    if(isNaN(currentBet) || currentBet <= 0){
      showMessage('Enter a valid bet!');
      return;
    }
    
    // Check if bet is valid
    if(currentBet > wallet){
      showMessage('Not enough funds!');
      return;
    }
    
    // Disable bet input
    if(betSelect) betSelect.disabled = true;
    
    gameActive = true;
    playerHand = [];
    dealerHand = [];
    
    // Deal initial cards
    playerHand.push(getRandomCard());
    playerHand.push(getRandomCard());
    dealerHand.push(getRandomCard());
    dealerHand.push(getRandomCard());
    
    // Display cards
    displayCards(playerHand, playerCardsEl, false);
    displayCards(dealerHand, dealerCardsEl, true); // Hide dealer's second card
    
    var playerTotal = calculateTotal(playerHand);
    
    // Check for blackjack
    if(playerTotal === 21){
      updateWallet(Math.floor(currentBet * 2.5)); // Blackjack pays 2.5x
      showMessage('BlackJack! +$' + Math.floor(currentBet * 2.5));
      displayCards(dealerHand, dealerCardsEl, false); // Show all dealer cards
      endGame();
      return;
    }
    
    // Update UI
    if(hitBtn) hitBtn.disabled = false;
    if(standBtn) standBtn.disabled = false;
    if(newGameBtn) newGameBtn.textContent = 'Deal';
    
    updateStatus('Your turn');
  }
  
  // Hit - player draws a card
  function hit(){
    if(!gameActive) return;
    animateButton(hitBtn);
    
    playerHand.push(getRandomCard());
    displayCards(playerHand, playerCardsEl, false);
    
    var total = calculateTotal(playerHand);
    
    if(total > 21){
      updateWallet(-currentBet); // Lose the bet
      showMessage('Busted! -$' + currentBet);
      displayCards(dealerHand, dealerCardsEl, false); // Show all dealer cards
      endGame();
    } else if(total === 21){
      updateWallet(Math.floor(currentBet * 1.5)); // Natural 21 pays 1.5x
      showMessage('21! +$' + Math.floor(currentBet * 1.5));
      dealerTurn();
    }
  }
  
  // Stand - dealer's turn
  function stand(){
    if(!gameActive) return;
    animateButton(standBtn);
    hitBtn.disabled = true;
    standBtn.disabled = true;
    dealerTurn();
  }
  
  // Dealer's turn
  function dealerTurn(){
    // Show all dealer cards
    displayCards(dealerHand, dealerCardsEl, false);
    
    var dealerTotal = calculateTotal(dealerHand);
    var playerTotal = calculateTotal(playerHand);
    
    // Dealer hits on < 17
    var cardIndex = 0;
    function dealCard(){
      dealerHand.push(getRandomCard());
      displayCards(dealerHand, dealerCardsEl, false);
      dealerTotal = calculateTotal(dealerHand);
      cardIndex++;
      
      if(dealerTotal >= 17){
        // Dealer done, determine winner
        if(dealerTotal > 21){
          updateWallet(currentBet); // Win the bet
          showMessage('Dealer busted! +$' + currentBet);
        } else if(dealerTotal > playerTotal){
          updateWallet(-currentBet); // Lose the bet
          showMessage('Dealer wins -$' + currentBet);
        } else if(dealerTotal < playerTotal){
          updateWallet(currentBet); // Win the bet
          showMessage('You win! +$' + currentBet);
        } else {
          showMessage('Push!');
        }
        endGame();
      } else {
        // Continue dealing
        setTimeout(dealCard, 300);
      }
    }
    
    if(dealerTotal < 17){
      setTimeout(dealCard, 300);
    } else {
      // Already 17+, determine winner immediately
      if(dealerTotal > 21){
        updateWallet(currentBet); // Win the bet
        showMessage('Dealer busted! +$' + currentBet);
      } else if(dealerTotal > playerTotal){
        updateWallet(-currentBet); // Lose the bet
        showMessage('Dealer wins -$' + currentBet);
      } else if(dealerTotal < playerTotal){
        updateWallet(currentBet); // Win the bet
        showMessage('You win! +$' + currentBet);
      } else {
        showMessage('Push!');
      }
      endGame();
    }
  }
  
  // End game
  function endGame(){
    gameActive = false;
    if(hitBtn) hitBtn.disabled = true;
    if(standBtn) standBtn.disabled = true;
    if(newGameBtn) newGameBtn.textContent = 'Deal';
    if(betSelect) betSelect.disabled = false;
  }
  
  // Get random card
  function getRandomCard(){
    return cards[Math.floor(Math.random() * cards.length)];
  }
  
  // Show temporary message
  function showMessage(msg, duration){
    if(typeof window.gsap === 'undefined'){
      console.log(msg);
      return;
    }
    
    if(!duration) duration = 2000;
    
    var msgEl = document.createElement('div');
    msgEl.textContent = msg;
    msgEl.style.cssText = 'position:absolute;right:10px;top:50px;background:rgba(0,0,0,0.9);color:var(--txt);padding:8px 16px;border-radius:6px;font-size:0.7rem;white-space:nowrap;z-index:1001';
    document.body.appendChild(msgEl);
    
    var gs = window.gsap;
    gs.from(msgEl, {opacity: 0, y: -10, duration: 0.3});
    gs.to(msgEl, {opacity: 0, y: -20, duration: 0.3, delay: duration/1000, onComplete: function(){ msgEl.remove(); }});
  }
  
  // Update game status
  function updateStatus(msg){
    // Optional status display
  }
  
  // Start over - reset game
  function startOver(){
    wallet = 100;
    playerHand = [];
    dealerHand = [];
    gameActive = false;
    currentBet = 0;
    
    // Update wallet
    if(walletEl) walletEl.textContent = wallet;
    
    // Clear cards
    if(playerCardsEl) playerCardsEl.innerHTML = '';
    if(dealerCardsEl) dealerCardsEl.innerHTML = '';
    
    // Reset UI
    if(hitBtn) hitBtn.disabled = true;
    if(standBtn) standBtn.disabled = true;
    if(betSelect) betSelect.disabled = false;
    if(newGameBtn) newGameBtn.textContent = 'Deal';
    
    showMessage('Game reset!', 1500);
  }
  
  // Event listeners
  if(hitBtn) hitBtn.addEventListener('click', hit);
  if(standBtn) standBtn.addEventListener('click', stand);
  if(newGameBtn) newGameBtn.addEventListener('click', newGame);
  if(resetBtn) resetBtn.addEventListener('click', startOver);
  
  // Initialize
  updateWallet(0); // Display initial wallet
  if(hitBtn) hitBtn.disabled = true;
  if(standBtn) standBtn.disabled = true;
  
})();

