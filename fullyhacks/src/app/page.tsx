import './page.css'
/*const MainPage = () => {

  return (
    
    <div className='center'>
      
      <div className="box">Hello</div>
    </div>
  );
};*/
const MainPage = () => {
  return (
    <>
      <header id="header">
        <a id="logo">navbar</a>
        <nav id="nav">
          <button id="btn">
            <span id="hamburguer">
              <span></span>
            </span>
          </button>
          <ul id="menu">
            <li><a href="/">about</a></li>
            <li><a href="/">skills</a></li>
            <li><a href="/">works</a></li>
          </ul>
        </nav>
      </header>

      <section className="wrapper">
        <div id="stars"></div>
        <div id="stars2"></div>
        <div id="stars3"></div>
      </section>
    </>
  );
};



export default MainPage


