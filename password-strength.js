(function() {

  var LOWERCASE_REGEX = /[a-z]/;
  var UPPERCASE_REGEX = /[A-Z]/;
  var NUMERIC_REGEX = /\d/;
  //var SPECIAL_REGEX = /[ !"#$%&'()*+,\-./:;<=>?@[\\\]^_`{|}~]/;
  var CRITERIA = [
    {label: 'At least 10 characters', test: function(str) {return str.length >= 10}},
    {label: 'At least 1 lowercase letter', test: function(str) {return LOWERCASE_REGEX.test(str)}},
    {label: 'At least 1 uppercase letter', test: function(str) {return UPPERCASE_REGEX.test(str)}},
    {label: 'At least 1 numeric character', test: function(str) {return NUMERIC_REGEX.test(str)}}
  ];


  var PS = window.PasswordStrength = function(el, args) {
    var ps = this;
    ps.element = el;
    ps.criteria = CRITERIA;

    ps.callbacks = args.callbacks || {};

    ps.container = document.createElement('div');
    ps.container.classList.add('password-strength-levels');

    ps.levels = [];
    for (var i=0; i<ps.criteria.length; i++) {
      var level = document.createElement('div');
      level.classList.add('password-strength-level');
      ps.container.appendChild(level);
      ps.levels.push(level);
    }

    ps.label = document.createElement('div');
    ps.label.classList.add('password-strength-label');
    ps.container.appendChild(ps.label);

    ps.help = document.createElement('div');
    ps.help.classList.add('password-strength-help');
    ps.help.innerHTML = 'Criteria for a good password:';
    for (i=0; i<ps.criteria.length; i++) {
      ps.help.insertAdjacentHTML('beforeend', '<div class="password-strength-criterion">'+ps.criteria[i].label+'</div>');
      ps.criteria[i].el = ps.help.lastChild;
    }
    ps.container.appendChild(ps.help);

    ps.element.parentNode.insertBefore(ps.container, ps.element.nextSibling);

    ps.element.addEventListener('focus', ps.callbacks.focus);
    ps.element.addEventListener('blur', ps.callbacks.blur);
    ps.element.addEventListener('keydown', function(e) {
      var val = e.target.value;
      var tries = 0;
      function checkUpdatedValue() {
        if (tries++ < 5 && e.target.value === val) return setTimeout(checkUpdatedValue, 10);
        ps.update(e.target.value);
      }
      setTimeout(checkUpdatedValue);
    });
    ps.currentStrength = 0;
  };


  PS.prototype.update = function(str) {
    var ps = this;
    ps.evalStrength(str);
    ps.container.classList[str.length ? 'add' : 'remove']('active');
    var qualities = ['poor', 'poor', 'okay', 'good'];
    for (var i=0; i<qualities.length; i++) ps.container.classList.remove(qualities[i]);
    var q = qualities[Math.max(ps.currentStrength-1,0)];
    ps.container.classList.add(q);
    ps.label.textContent = q;
    ps.activateLevels();
    if (ps.currentStrength < ps.criteria.length) ps.startHelpTimer();
    else ps.clearHelpTimer();
    if (ps.callbacks.update) ps.callbacks.update();
  };


  PS.prototype.activateLevels = function() {
    var ps = this;
    var l = ps.currentStrength;
    l = Math.min(l, ps.levels.length);
    for (var i=0; i<ps.levels.length; i++) {
      ps.levels[i].classList.remove('active');
    }
    for (i=0; i<l; i++) {
      ps.levels[i].classList.add('active');
    }
  };


  PS.prototype.showHelp = function() {
    var ps = this;
    ps.container.classList.add('help-active');
  };

  PS.prototype.hideHelp = function() {
    var ps = this;
    ps.container.classList.remove('help-active');
  };

  PS.prototype.startHelpTimer = function() {
    var ps = this;
    if (ps._helpTimer) return;
    ps._helpTimer = setTimeout(function() {
      if (ps.currentStrength < ps.criteria.length) ps.showHelp();
    }, 2000);
  };

  PS.prototype.clearHelpTimer = function() {
    var ps = this;
    clearInterval(ps._helpTimer);
    delete ps._helpTimer;
  };


  PS.prototype.evalStrength = function(str) {
    var ps = this;
    if (!str) {
      ps.currentStrength = 0;
      return 0;
    }
    var strength = 0;

    for (var i=0; i<ps.criteria.length; i++) {
      if (ps.criteria[i].test(str)) {
        ps.criteria[i].el.classList.add('active');
        strength++;
      }
      else ps.criteria[i].el.classList.remove('active');
    }

    ps.currentStrength = strength;
    return strength;
  };


  PS.prototype.focus = function() {
    this.element.focus();
  };
  PS.prototype.blur = function() {
    this.element.blur();
  };

})();
