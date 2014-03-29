#!/usr/bin/env ruby

require 'net/http'
require 'rexml/document'

ProgramName = File.basename($0)
ProgramVers = "0.2"
ProgramAuth = "Patrick Mueller (pmuellr@yahoo.com)"

#--------------------------------------------------------------------
# sea / wave forecasts available here:
#     http://www.nws.noaa.gov/om/marine/zone/usamz.htm
#--------------------------------------------------------------------

UrlHost   = "weather.noaa.gov"
UrlPath   = "/cgi-bin/fmtbltn.pl?file=forecasts/marine/coastal/am"
UrlPrefix = "http://#{UrlHost}#{UrlPath}"

#--------------------------------------------------------------------
# locations to get the forecast for;
#   [0]  human readable name
#   [1]  uri of the report to fetch
#   [2]  latitude
#   [3]  longitude
#   [4]  zip code (for weather)
#--------------------------------------------------------------------
locationData = [
  [ 
    "Wrightsville Beach",
    "amz250.txt",
    34.206479, -77.791357,
    28480
  ],
  
  [
    "Emerald Isle",
    "amz158.txt",
    34.6713, -76.98763,
    28594
  ],
  
  [
    "Ocracoke",
    "amz154.txt",
    35.108535, -75.942307,
    27960
  ],
  
  [
    "Hatteras",
    "amz152.txt",
    35.491425, -75.462685,
    27943
  ],
  
  [
    "Outer Banks",
    "amz150.txt",
    35.974116, -75.648937,
    27948
  ],
  
]

#--------------------------------------------------------------------
# information about a location
#--------------------------------------------------------------------
class Location
  attr_accessor :name, :uri, :lat, :long, :zip, :weather, :seas
  
  #------------------------------------------------------------------
  # constructor
  #------------------------------------------------------------------
  def initialize(name, uri, lat, long, zip)
    @name = name
    @uri  = uri
    @long = long
    @lat  = lat
    @zip  = zip
    
    puts "Processing #{name}"
    getWeather
    getSeas
  end

  private
  
  #------------------------------------------------------------------
  # get the weather forecast
  #------------------------------------------------------------------
  def getWeather()
    puts "   getting weather"
    xml  = Net::HTTP.get("xml.weather.yahoo.com", "/forecastrss?p=#{@zip}")
    doc  = REXML::Document.new xml
    root = doc.root
    html = root.elements['channel/item/description'].text
    
    @weather = html.gsub(%r{<img.*?>}mi,"")
    @weather = @weather.sub(%r{<br.*?>}mi,"")
    @weather = "#{@weather}<p><a href='http://www.wunderground.com/cgi-bin/findweather/getForecast?query=#{@zip}'>Weather Underground Forecast</a>" 
  end

  #------------------------------------------------------------------
  # get the sea info
  #------------------------------------------------------------------
  def getSeas()
    puts "   getting sea forecasts"
    html = Net::HTTP.get(UrlHost, "#{UrlPath}/#{@uri}")
  
    #------------------------------------------------------------------
    # extract the juicy center
    #------------------------------------------------------------------
    prePattern   = %r{<PRE>(.*)</PRE>}m
    match = prePattern.match(html)
    if (!match)
      @seas = "<p>Unable to parse sea forecast.</p>"
      return
    end
    
    html = match[1]
  
    #------------------------------------------------------------------
    # split the file at bolded terms; this will give us header/body/header/...
    #------------------------------------------------------------------
    sections = html.split(%r{<B>|</B>})

    #------------------------------------------------------------------
    # remove all the initial sections until we have a known header
    #------------------------------------------------------------------
    firstPattern = %r{<FONT .* COLOR="#800000">}
    while (!firstPattern.match(sections.first))
      sections.shift
    end

    #------------------------------------------------------------------
    # now build the table, one row per 'day'
    #------------------------------------------------------------------
    html = "\n<table>\n"
    while (!sections.empty?)
      header, body, *sections = sections

      header.gsub!(%r{<.*?>},'')

      header = header.downcase.strip
      body   = body.downcase.strip
      body   = getWaveInfo(body)

      header = header.gsub(" ","&nbsp;")
      
      next if header.include?("night")

      html += "<tr><td><b>#{header}</b></td><td>&nbsp;&nbsp;</td><td>#{body}</tr>\n"
    end
  
    @seas = "#{html}</table>\n"
  end

  #------------------------------------------------------------------
  def getWaveInfo(text)
    seasPattern  = %r{.*?(SEAS.*?FT).*}mi
    wavesPattern = %r{.*?(WAVES.*?FT).*}mi

    match = seasPattern.match(text)
    return match[1] if match

    match = wavesPattern.match(text)
    return match[1] if match

    return "???"
  end
  
end

#--------------------------------------------------------------------
# main program
#--------------------------------------------------------------------
oFileName = "ncSeasMap.kml"

#--------------------------------------------------------------------
# get location data
#--------------------------------------------------------------------

locations = []
locationData.each do | loc |
  locations << Location.new(loc[0], loc[1], loc[2], loc[3], loc[4])
end

#--------------------------------------------------------------------
# write the output file
#--------------------------------------------------------------------
dateTime = Time.now.gmtime.strftime("Scraped at %H:%M UTC on %a, %b %d %Y.")
   
#------------------------------------------------------------------
# the header
#------------------------------------------------------------------
kmlHeader = <<KML_HEADER
<?xml version='1.0' encoding='UTF-8'?>
<kml xmlns='http://earth.google.com/kml/2.1'>
   <Document>
      <name>North Carolina Seas</name>
      <Style id="boogie-board-icon">
         <IconStyle>
            <Icon>
               <href>http://muellerware.org/projects/ncSeasMap/boogie-board.gif</href>
            </Icon>
         </IconStyle>
      </Style>     
      <Folder>
         <name>North Carolina Seas</name>
         <open>1</open>
         <description>Seas of North Carolina.</description>
KML_HEADER

#------------------------------------------------------------------
#
#------------------------------------------------------------------
kmlTrailer = <<KML_TRAILER
      </Folder>
   </Document>
</kml>
KML_TRAILER

#------------------------------------------------------------------
#
#------------------------------------------------------------------
File.open(oFileName,"w") { | file |

  file.puts(kmlHeader)

  #------------------------------------------------------------------
  #
  #------------------------------------------------------------------
  locations.each { |location|
    
    kmlEntry = <<KML_ENTRY
         <Placemark>
            <name>#{location.name}</name>
            <styleUrl>#boogie-board-icon</styleUrl>
            <description><![CDATA[
               <p>
#{location.weather}               
               </p>
#{location.seas}               
               <br/><a href="#{UrlPrefix}/#{location.uri}">Full Sea Forecast at NOAA</a></b>
               <p><i><small>#{dateTime}</small></i></p>
            ]]></description>
            <Snippet></Snippet>
            <Point>
               <coordinates>#{location.long},#{location.lat},0</coordinates>
            </Point>
         </Placemark>
KML_ENTRY
    
    file.puts(kmlEntry)
  }

  file.puts(kmlTrailer) 
}

#--------------------------------------------------------------------
# write summary
#--------------------------------------------------------------------
puts "Wrote #{locations.size} locations to #{oFileName}"