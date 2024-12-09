import React from 'react';

function Impressum() {
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Impressum</h1>
      
      <section className="mb-6">
        <h2 className="text-2xl font-semibold mb-4">Kontakt und Betrieb der Webapp</h2>
        <p>
          Nico Wälti<br />
          E-Mail: nico.waelti@yahoo.de
        </p>
      </section>
      
      <section className="mb-6">
        <h2 className="text-2xl font-semibold mb-4">Haftungsausschluss</h2>
        <p>
          Diese Webapp wird ohne Gewährleistung und Support bereitgestellt. 
          Funktionsanfragen und Supportanfragen sollen direkt mit dem 
          Gemeinschaftsleiter René besprochen werden.
        </p>
      </section>
      
      <section>
        <h2 className="text-2xl font-semibold mb-4">Haftung für Inhalte</h2>
        <p>
          Die Inhalte unserer Seiten wurden mit größter Sorgfalt erstellt. 
          Für die Richtigkeit, Vollständigkeit und Aktualität der Inhalte 
          können wir jedoch keine Gewähr übernehmen.
        </p>
      </section>
    </div>
  );
}

export default Impressum;
