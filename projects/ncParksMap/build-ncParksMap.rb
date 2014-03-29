#!/usr/bin/env ruby

require 'net/http'
require 'rexml/document'

ProgramName = File.basename($0)
ProgramVers = "0.6"
ProgramAuth = "Patrick Mueller (pmuellr@yahoo.com)"

#--------------------------------------------------------------------
# defines weather info
#--------------------------------------------------------------------
class Weather
  attr_reader :desc
  
  #------------------------------------------------------------------
  # initializer
  #------------------------------------------------------------------
  def initialize(desc) 
    @desc  = desc
  end
  
end

#--------------------------------------------------------------------
# defines a location on the map
#--------------------------------------------------------------------
class Location

  attr_reader :name, :url, :zip, :lat, :long, :weather
  attr_writer                                 :weather
   
  #------------------------------------------------------------------
  # initializer
  #------------------------------------------------------------------
  def initialize(name, url, zip, lat, long)
    @name = name
    @url  = url
    @zip  = zip
    @lat  = lat
    @long = long
  end
  
  #------------------------------------------------------------------
  # return string representation
  #------------------------------------------------------------------
  def to_s()
    "#{@name}\n\t#{@url}\n\t#{@zip}\n\t#{@lat}, #{@long}\n"
  end

  #------------------------------------------------------------------
  # return whether entry is complete
  #------------------------------------------------------------------
  def is_complete?()
    return false if @name.nil? || @name.empty?
    return false if @url.nil?  || @url.empty? 
    return false if @zip.nil?  || @zip.empty?
    return false if @lat.nil?  || @lat.empty?
    return false if @long.nil? || @long.empty?
    true 
  end
  
end

#--------------------------------------------------------------------
# 
#--------------------------------------------------------------------
def help() 
  print <<HELP
#{ProgramName} version: #{ProgramVers}
#{ProgramAuth}

Create a .kml file of NC State Parks plus some weather info.

Usage:
   #{ProgramName} csvInputFile outputFile
HELP

  exit
end


#--------------------------------------------------------------------
# main program
#--------------------------------------------------------------------
iFileName = ARGV[0]
oFileName = ARGV[1]
help if (iFileName.nil?)
help if (oFileName.nil?)

if (!File.exists?(iFileName))
  puts("File '#{iFileName}' not found.")
  exit
end

#--------------------------------------------------------------------
# read the input file
#--------------------------------------------------------------------
lines = IO.readlines(iFileName)

locations = []
currLocation = nil
lines.each { |line|
  next if (line =~ /^\s*#/)
  next if (line =~ /name,/)

  cells = line.rstrip.split(",")
  name = cells[0]
  url  = cells[1]
  zip  = cells[2]
  lat  = cells[3]
  long = cells[4]
  
  location = Location.new(name, url, zip, lat, long)
  locations.push(location)
}

#--------------------------------------------------------------------
# print incomplete entries
#--------------------------------------------------------------------
newLocations = []

locations.each { | location |
    if location.is_complete?
      newLocations.push(location)
    else 
      puts "incomplete entry: #{location}"
    end
}

locations = newLocations

#--------------------------------------------------------------------
# get weather data
#--------------------------------------------------------------------
locations.each { | location |
  zip = location.zip
  
  puts("Getting weather for #{location.name}")
  xml  = Net::HTTP.get("xml.weather.yahoo.com", "/forecastrss?p=#{zip}")
  doc  = REXML::Document.new xml
  root = doc.root

  desc = root.elements['channel/item/description'].text
 
  location.weather = Weather.new(desc)
}

#--------------------------------------------------------------------
# write the output file
#--------------------------------------------------------------------
dateTime = Time.now.gmtime.strftime("Scraped at %H:%M UTC on %a, %b %d %Y.")


  htmlHeader = <<HTML_HEADER
<?xml version='1.0' encoding='UTF-8'?>
<kml xmlns='http://earth.google.com/kml/2.1'>
   <Document>
      <name>North Carolina Parks</name>
      <Style id="hiking-icon">
         <IconStyle>
            <Icon>
               <href>http://kh.google.com:80/flatfile?lf-0-icons/hiking_n.png</href>
            </Icon>
         </IconStyle>
      </Style>     
      
      <Folder>
         <name>North Carolina Parks</name>
         <open>1</open>
         <description>Parks of North Carolina.</description>
HTML_HEADER

  htmlTrailer = <<HTML_TRAILER
      </Folder>
   </Document>
</kml>
HTML_TRAILER

File.open(oFileName,"w") { | file |

  file.puts(htmlHeader)

  locations.each { |location|
    geotagURL     = "http://www.flickr.com/map/?&fLat=#{location.lat}&fLon=#{location.long}&zl=5"
    
    htmlEntry = <<HTML_ENTRY
         <Placemark>
            <name>#{location.name}</name>
            <styleUrl>#hiking-icon</styleUrl>
            <description><![CDATA[
               <p>Visit the <a href="#{location.url}">park's web site</a>.
               Show <a href="#{geotagURL}">geotagged Flickr pictures</a>.</p>
               #{location.weather.desc}
               <p><a href='http://www.wunderground.com/cgi-bin/findweather/getForecast?query=#{location.zip}'>Weather Underground Forecast</a>
               <p><i><small>#{dateTime}</small></i></p>
            ]]></description>
            <Snippet></Snippet>
            <Point>
               <coordinates>#{location.long},#{location.lat},0</coordinates>
            </Point>
         </Placemark>
HTML_ENTRY
    
    file.puts(htmlEntry)
  }

  file.puts(htmlTrailer) 
}

#--------------------------------------------------------------------
# write summary
#--------------------------------------------------------------------
puts "Wrote #{locations.size} locations to #{oFileName}"